import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, shareReplay } from 'rxjs';
import { ServicosDataService, ServicoRAS, TrocaServico } from './servicos-data.service';
import { FinanceiroDataService, MetaFinanceira, DadosFinanceiros } from '../../financeiro/financeiro-data.service';
import { ConflictValidationService, ServicoBase } from './conflict-validation.service';

export interface DashboardCompleto {
  resumoFinanceiro: ResumoFinanceiroCompleto;
  metas: MetaComProgresso[];
  alertas: AlertaFinanceiro[];
  calendario: EventoCalendario[];
  estatisticas: EstatisticasAvancadas;
}

export interface ResumoFinanceiroCompleto {
  ordinario?: {
    salarioBase: number;
    exibir: boolean;
  };
  rasVoluntario: {
    valor: number;
    quantidade: number;
    crescimento?: number;
  };
  rasCompulsorio: {
    valor: number;
    quantidade: number;
    crescimento?: number;
  };
  trocas: {
    ordinarias: {
      valor: number;
      quantidade: number;
    };
    rasCompulsorio: {
      valor: number;
      quantidade: number;
    };
    total: number;
  };
  totalGeral: number;
  comparativoMesAnterior: {
    crescimento: number;
    diferenca: number;
  };
  projecaoMensal: {
    valorEstimado: number;
    baseadoEm: string;
  };
  statusPagamentos: {
    pago: number;
    pendente: number;
    processando: number;
  };
}

export interface MetaComProgresso extends MetaFinanceira {
  progresso: {
    percentual: number;
    valorFaltante: number;
    diasRestantes: number;
    ritmoNecessario: number;
  };
  probabilidadeSucesso: number;
}

export interface AlertaFinanceiro {
  id: string;
  tipo: 'meta-atrasada' | 'meta-em-risco' | 'conflito-horario' | 'pagamento-pendente' | 'meta-concluida';
  nivel: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  descricao: string;
  acao?: string;
  data: Date;
}

export interface EventoCalendario {
  data: Date;
  servicos: any[];
  valorTotal: number;
  temServicos: boolean;
  tiposServicos: string[];
  temConflito: boolean;
  coresServicos: string[];
  statusFinanceiro: 'pago' | 'pendente' | 'processando';
}

export interface EstatisticasAvancadas {
  mediaValorServico: number;
  servicosPorTipo: { [tipo: string]: number };
  tendenciaMensal: 'crescente' | 'decrescente' | 'estavel';
  eficienciaMetas: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardIntegrationService {
  
  private _dashboardData = new BehaviorSubject<DashboardCompleto | null>(null);
  private _alertas = new BehaviorSubject<AlertaFinanceiro[]>([]);
  
  public dashboardData$ = this._dashboardData.asObservable();
  public alertas$ = this._alertas.asObservable();
  
  constructor(
    private servicosDataService: ServicosDataService,
    private financeiroDataService: FinanceiroDataService,
    private conflictValidationService: ConflictValidationService
  ) {
    this.inicializarIntegracao();
  }

  private inicializarIntegracao(): void {
    // Combinar todos os observables relevantes
    combineLatest([
      this.servicosDataService.servicosRAS$,
      this.servicosDataService.trocas$,
      this.financeiroDataService.metas$,
      this.financeiroDataService.dadosFinanceiros$
    ]).pipe(
      map(([servicosRAS, trocas, metas, dadosFinanceiros]) => 
        this.combinarDadosCompletos(servicosRAS, trocas, metas, dadosFinanceiros)
      ),
      shareReplay(1)
    ).subscribe(dashboardCompleto => {
      this._dashboardData.next(dashboardCompleto);
      this.atualizarAlertas(dashboardCompleto);
    });
  }

  private combinarDadosCompletos(
    servicosRAS: ServicoRAS[],
    trocas: TrocaServico[],
    metas: MetaFinanceira[],
    dadosFinanceiros: DadosFinanceiros[]
  ): DashboardCompleto {
    
    const resumoFinanceiro = this.calcularResumoCompleto(servicosRAS, trocas, dadosFinanceiros);
    const metasComProgresso = this.calcularProgressoMetas(metas, resumoFinanceiro);
    const calendario = this.gerarEventosCalendario(servicosRAS, trocas, dadosFinanceiros);
    const estatisticas = this.calcularEstatisticas(servicosRAS, trocas, dadosFinanceiros);
    
    return {
      resumoFinanceiro,
      metas: metasComProgresso,
      alertas: [],
      calendario,
      estatisticas
    };
  }

  private calcularResumoCompleto(
    servicosRAS: ServicoRAS[],
    trocas: TrocaServico[],
    dadosFinanceiros: DadosFinanceiros[]
  ): ResumoFinanceiroCompleto {
    
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    // Filtrar dados do mês atual
    const servicosMes = servicosRAS.filter(s => {
      const dataServico = new Date(s.data);
      return dataServico >= inicioMes && dataServico <= fimMes;
    });
    
    const trocasMes = trocas.filter(t => {
      const dataTroca = new Date(t.data);
      return dataTroca >= inicioMes && dataTroca <= fimMes;
    });
    
    const dadosFinanceirosMes = dadosFinanceiros.filter(d => {
      const dataServico = new Date(d.dataServico);
      return dataServico >= inicioMes && dataServico <= fimMes;
    });

    // Calcular valores por tipo
    const rasVoluntario = this.calcularRASVoluntario(servicosMes, dadosFinanceirosMes);
    const rasCompulsorio = this.calcularRASCompulsorio(servicosMes, dadosFinanceirosMes);
    const trocasCalc = this.calcularTrocas(trocasMes, dadosFinanceirosMes);
    
    // Calcular comparativos e projeções
    const comparativo = this.calcularComparativoMesAnterior(dadosFinanceiros);
    const projecao = this.calcularProjecaoMensal(dadosFinanceirosMes);
    const statusPagamentos = this.calcularStatusPagamentos(dadosFinanceirosMes);
    
    const totalGeral = rasVoluntario.valor + rasCompulsorio.valor + trocasCalc.total;

    return {
      rasVoluntario,
      rasCompulsorio,
      trocas: trocasCalc,
      totalGeral,
      comparativoMesAnterior: comparativo,
      projecaoMensal: projecao,
      statusPagamentos
    };
  }

  private calcularRASVoluntario(servicos: ServicoRAS[], dadosFinanceiros: DadosFinanceiros[]) {
    const rasVol = servicos.filter(s => s.tipo === 'voluntario');
    const dadosRasVol = dadosFinanceiros.filter(d => d.tipoServico === 'ras-voluntario');
    
    const valor = dadosRasVol.reduce((sum, d) => sum + d.valorTotal, 0);
    const quantidade = rasVol.length;
    
    return { valor, quantidade };
  }

  private calcularRASCompulsorio(servicos: ServicoRAS[], dadosFinanceiros: DadosFinanceiros[]) {
    const rasComp = servicos.filter(s => s.tipo === 'compulsorio');
    const dadosRasComp = dadosFinanceiros.filter(d => d.tipoServico === 'ras-compulsorio');
    
    const valor = dadosRasComp.reduce((sum, d) => sum + d.valorTotal, 0);
    const quantidade = rasComp.length;
    
    return { valor, quantidade };
  }

  private calcularTrocas(trocas: TrocaServico[], dadosFinanceiros: DadosFinanceiros[]) {
    const trocasOrdinarias = trocas.filter(t => t.tipo === 'ordinario');
    const trocasRAS = trocas.filter(t => t.tipo === 'ras-compulsorio');
    
    const dadosTrocas = dadosFinanceiros.filter(d => d.tipoServico === 'troca');
    
    const valorOrdinarias = trocasOrdinarias.reduce((sum, t) => sum + (t.valorFinal || 0), 0);
    const valorRASCompulsorio = trocasRAS.reduce((sum, t) => sum + (t.valorFinal || 0), 0);
    
    return {
      ordinarias: {
        valor: valorOrdinarias,
        quantidade: trocasOrdinarias.length
      },
      rasCompulsorio: {
        valor: valorRASCompulsorio,
        quantidade: trocasRAS.length
      },
      total: valorOrdinarias + valorRASCompulsorio
    };
  }

  private calcularComparativoMesAnterior(dadosFinanceiros: DadosFinanceiros[]) {
    const hoje = new Date();
    const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    
    const valorMesAtual = dadosFinanceiros
      .filter(d => new Date(d.dataServico) >= inicioMesAtual)
      .reduce((sum, d) => sum + d.valorTotal, 0);
    
    const valorMesAnterior = dadosFinanceiros
      .filter(d => {
        const data = new Date(d.dataServico);
        return data >= inicioMesAnterior && data <= fimMesAnterior;
      })
      .reduce((sum, d) => sum + d.valorTotal, 0);
    
    const diferenca = valorMesAtual - valorMesAnterior;
    const crescimento = valorMesAnterior > 0 ? (diferenca / valorMesAnterior) * 100 : 0;
    
    return { crescimento, diferenca };
  }

  private calcularProjecaoMensal(dadosFinanceirosMes: DadosFinanceiros[]) {
    const hoje = new Date();
    const diasDecorridos = hoje.getDate();
    const totalDiasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    
    const valorAtual = dadosFinanceirosMes.reduce((sum, d) => sum + d.valorTotal, 0);
    const mediaDiaria = valorAtual / diasDecorridos;
    const valorEstimado = mediaDiaria * totalDiasMes;
    
    return {
      valorEstimado,
      baseadoEm: 'ritmo-atual'
    };
  }

  private calcularStatusPagamentos(dadosFinanceiros: DadosFinanceiros[]) {
    const pago = dadosFinanceiros
      .filter(d => d.statusPagamento === 'pago')
      .reduce((sum, d) => sum + d.valorTotal, 0);
    
    const pendente = dadosFinanceiros
      .filter(d => d.statusPagamento === 'pendente')
      .reduce((sum, d) => sum + d.valorTotal, 0);
    
    const processando = dadosFinanceiros
      .filter(d => d.statusPagamento === 'processando')
      .reduce((sum, d) => sum + d.valorTotal, 0);
    
    return { pago, pendente, processando };
  }

  private calcularProgressoMetas(metas: MetaFinanceira[], resumo: ResumoFinanceiroCompleto): MetaComProgresso[] {
    return metas.map(meta => {
      const valorAtual = resumo.totalGeral;
      const percentual = (valorAtual / meta.valorMeta) * 100;
      const valorFaltante = Math.max(0, meta.valorMeta - valorAtual);
      
      const hoje = new Date();
      const prazo = new Date(meta.prazoMeta);
      const diasRestantes = Math.max(0, Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)));
      
      const ritmoNecessario = diasRestantes > 0 ? valorFaltante / diasRestantes : 0;
      const probabilidadeSucesso = this.calcularProbabilidadeSucesso(percentual, diasRestantes);
      
      return {
        ...meta,
        progresso: {
          percentual: Math.min(100, percentual),
          valorFaltante,
          diasRestantes,
          ritmoNecessario
        },
        probabilidadeSucesso
      };
    });
  }

  private calcularProbabilidadeSucesso(percentual: number, diasRestantes: number): number {
    if (percentual >= 100) return 100;
    if (diasRestantes <= 0) return 0;
    
    // Lógica simples: baseada no percentual atual vs tempo restante
    const ritmoAtual = percentual;
    const ritmoNecessario = 100;
    const eficiencia = ritmoAtual / ritmoNecessario;
    
    return Math.min(100, Math.max(0, eficiencia * 100));
  }

  private gerarEventosCalendario(
    servicosRAS: ServicoRAS[],
    trocas: TrocaServico[],
    dadosFinanceiros: DadosFinanceiros[]
  ): EventoCalendario[] {
    const eventos: EventoCalendario[] = [];
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    // Agrupar por data
    const eventosPorData: { [data: string]: any[] } = {};
    
    // Adicionar serviços RAS
    servicosRAS.forEach(servico => {
      const data = servico.data;
      if (!eventosPorData[data]) eventosPorData[data] = [];
      eventosPorData[data].push({
        ...servico,
        tipoEvento: 'servico',
        tipoServico: `ras-${servico.tipo}`
      });
    });
    
    // Adicionar trocas
    trocas.forEach(troca => {
      const data = troca.data;
      if (!eventosPorData[data]) eventosPorData[data] = [];
      eventosPorData[data].push({
        ...troca,
        tipoEvento: 'troca',
        tipoServico: `troca-${troca.tipo}`
      });
    });

    // Adicionar eventos mock adicionais para demonstração
    this.adicionarEventosMockCalendario(eventosPorData, inicioMes);
    
    // Converter para EventoCalendario
    Object.keys(eventosPorData).forEach(dataStr => {
      const data = new Date(dataStr);
      if (data >= inicioMes && data <= fimMes) {
        const servicos = eventosPorData[dataStr];
        const valorTotal = servicos.reduce((sum, s) => sum + (s.valorTotal || s.valorFinal || 0), 0);
        const tiposServicos = servicos.map(s => s.tipoServico);
        const temConflito = this.detectarConflito(servicos);
        
        // Buscar status financeiro
        const dadosData = dadosFinanceiros.filter(d => 
          new Date(d.dataServico).toDateString() === data.toDateString()
        );
        const statusFinanceiro = this.determinarStatusFinanceiro(dadosData);
        
        eventos.push({
          data,
          servicos,
          valorTotal,
          temServicos: servicos.length > 0,
          tiposServicos,
          temConflito,
          coresServicos: this.calcularCoresServicos(tiposServicos, temConflito),
          statusFinanceiro
        });
      }
    });
    
    return eventos.sort((a, b) => a.data.getTime() - b.data.getTime());
  }

  private adicionarEventosMockCalendario(eventosPorData: { [data: string]: any[] }, inicioMes: Date): void {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    // Eventos mock adicionais para um calendário mais realista
    const eventosMock = [
      {
        data: new Date(ano, mes, 3).toISOString().split('T')[0],
        evento: {
          id: 'mock-ord-001',
          tipoEvento: 'ordinario',
          tipoServico: 'ordinario',
          horaInicio: '08:00',
          horaFim: '16:00',
          valorTotal: 320.00,
          statusPagamento: 'pago',
          local: 'Sede da Unidade',
          observacoes: 'Serviço ordinário de rotina'
        }
      },
      {
        data: new Date(ano, mes, 5).toISOString().split('T')[0],
        evento: {
          id: 'mock-ras-001',
          tipoEvento: 'servico',
          tipoServico: 'ras-voluntario',
          horaInicio: '18:00',
          horaFim: '00:00',
          valorTotal: 520.00,
          statusPagamento: 'processando',
          local: 'Centro da Cidade',
          observacoes: 'RAS voluntário - evento especial'
        }
      },
      {
        data: new Date(ano, mes, 8).toISOString().split('T')[0],
        evento: {
          id: 'mock-troca-001',
          tipoEvento: 'troca',
          tipoServico: 'troca-ordinario',
          horaInicio: '14:00',
          horaFim: '22:00',
          valorTotal: 240.00,
          valorFinal: 240.00,
          statusPagamento: 'pendente',
          local: 'Projeto Especial',
          observacoes: 'Troca de serviço autorizada'
        }
      },
      {
        data: new Date(ano, mes, 12).toISOString().split('T')[0],
        evento: {
          id: 'mock-ras-comp-001',
          tipoEvento: 'servico',
          tipoServico: 'ras-compulsorio',
          horaInicio: '06:00',
          horaFim: '18:00',
          valorTotal: 540.00,
          statusPagamento: 'pago',
          local: 'Operação Especial',
          observacoes: 'RAS compulsório - operação'
        }
      },
      {
        data: new Date(ano, mes, 14).toISOString().split('T')[0],
        eventos: [
          {
            id: 'mock-conflito-1',
            tipoEvento: 'servico',
            tipoServico: 'ras-voluntario',
            horaInicio: '08:00',
            horaFim: '14:00',
            valorTotal: 390.00,
            statusPagamento: 'pendente',
            local: 'Local A',
            observacoes: 'RAS voluntário - manhã'
          },
          {
            id: 'mock-conflito-2',
            tipoEvento: 'troca',
            tipoServico: 'troca-ordinario',
            horaInicio: '12:00',
            horaFim: '18:00',
            valorTotal: 180.00,
            valorFinal: 180.00,
            statusPagamento: 'pendente',
            local: 'Local B',
            observacoes: 'Troca - tarde (CONFLITO)'
          }
        ]
      },
      {
        data: new Date(ano, mes, 18).toISOString().split('T')[0],
        evento: {
          id: 'mock-ord-002',
          tipoEvento: 'ordinario',
          tipoServico: 'ordinario',
          horaInicio: '06:00',
          horaFim: '14:00',
          valorTotal: 320.00,
          statusPagamento: 'pago',
          local: 'Patrulhamento',
          observacoes: 'Serviço de patrulhamento'
        }
      },
      {
        data: new Date(ano, mes, 26).toISOString().split('T')[0],
        evento: {
          id: 'mock-ras-vol-002',
          tipoEvento: 'servico',
          tipoServico: 'ras-voluntario',
          horaInicio: '19:00',
          horaFim: '01:00',
          valorTotal: 390.00,
          statusPagamento: 'processando',
          local: 'Evento Cultural',
          observacoes: 'RAS voluntário - evento cultural'
        }
      },
      {
        data: new Date(ano, mes, 28).toISOString().split('T')[0],
        evento: {
          id: 'mock-troca-ras-001',
          tipoEvento: 'troca',
          tipoServico: 'troca-ras',
          horaInicio: '00:00',
          horaFim: '12:00',
          valorTotal: 600.00,
          valorFinal: 600.00,
          statusPagamento: 'pago',
          local: 'Operação Noturna',
          observacoes: 'Troca RAS compulsório'
        }
      }
    ];

    // Adicionar eventos mock ao calendário
    eventosMock.forEach(mockData => {
      const dataStr = mockData.data;
      if (!eventosPorData[dataStr]) eventosPorData[dataStr] = [];
      
      if ('eventos' in mockData && mockData.eventos) {
        // Múltiplos eventos (conflito)
        mockData.eventos.forEach(evento => {
          eventosPorData[dataStr].push(evento);
        });
      } else if ('evento' in mockData) {
        // Evento único
        eventosPorData[dataStr].push(mockData.evento);
      }
    });
  }

  private detectarConflito(servicos: any[]): boolean {
    if (servicos.length <= 1) return false;
    
    // Converter para ServicoBase
    const servicosBase: ServicoBase[] = servicos.map(s => ({
      id: s.id || `temp-${Date.now()}-${Math.random()}`,
      data: s.data,
      horaInicio: s.horaInicio || '00:00',
      horaFim: s.horaFim || '23:59',
      tipo: this.mapearTipoParaValidacao(s.tipoServico || s.tipo),
      tipoEvento: s.tipoEvento
    }));
    
    const validationResult = this.conflictValidationService.validateServiceConflicts(servicosBase);
    return !validationResult.isValid;
  }

  private mapearTipoParaValidacao(tipo: string): 'ordinario' | 'voluntario' | 'compulsorio' | 'troca-ordinario' | 'troca-ras' {
    const mapeamento: { [key: string]: any } = {
      'ordinario': 'ordinario',
      'ras-voluntario': 'voluntario',
      'ras-compulsorio': 'compulsorio',
      'troca-ordinario': 'troca-ordinario',
      'troca-ras': 'troca-ras',
      'voluntario': 'voluntario',
      'compulsorio': 'compulsorio'
    };
    
    return mapeamento[tipo] || 'ordinario';
  }

  private verificarSobreposicaoHorario(servico1: any, servico2: any): boolean {
    const inicio1 = this.converterHoraParaMinutos(servico1.horaInicio || '00:00');
    const fim1 = this.converterHoraParaMinutos(servico1.horaFim || '23:59');
    const inicio2 = this.converterHoraParaMinutos(servico2.horaInicio || '00:00');
    const fim2 = this.converterHoraParaMinutos(servico2.horaFim || '23:59');
    
    return !(fim1 <= inicio2 || fim2 <= inicio1);
  }

  private converterHoraParaMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  private calcularCoresServicos(tiposServicos: string[], temConflito: boolean): string[] {
    const coresMap: { [key: string]: string } = {
      'ordinario': '#4A90E2',
      'ras-voluntario': '#7ED321',
      'ras-compulsorio': '#F5A623',
      'troca-ordinario': '#9013FE',
      'troca-ras': '#BD10E0',
      'conflito': '#D0021B'
    };
    
    const cores = tiposServicos.map(tipo => coresMap[tipo] || '#CCCCCC');
    if (temConflito) cores.push(coresMap['conflito']);
    
    return cores;
  }

  private determinarStatusFinanceiro(dadosFinanceiros: DadosFinanceiros[]): 'pago' | 'pendente' | 'processando' {
    if (dadosFinanceiros.length === 0) return 'pendente';
    
    const temPendente = dadosFinanceiros.some(d => d.statusPagamento === 'pendente');
    const temProcessando = dadosFinanceiros.some(d => d.statusPagamento === 'processando');
    
    if (temPendente) return 'pendente';
    if (temProcessando) return 'processando';
    return 'pago';
  }

  private calcularEstatisticas(
    servicosRAS: ServicoRAS[],
    trocas: TrocaServico[],
    dadosFinanceiros: DadosFinanceiros[]
  ): EstatisticasAvancadas {
    
    const mediaValorServico = dadosFinanceiros.length > 0 ? 
      dadosFinanceiros.reduce((sum, d) => sum + d.valorTotal, 0) / dadosFinanceiros.length : 0;
    
    const servicosPorTipo: { [tipo: string]: number } = {};
    dadosFinanceiros.forEach(d => {
      servicosPorTipo[d.tipoServico] = (servicosPorTipo[d.tipoServico] || 0) + 1;
    });
    
    return {
      mediaValorServico,
      servicosPorTipo,
      tendenciaMensal: 'estavel', // Seria calculado com base em histórico
      eficienciaMetas: 75 // Seria calculado com base no progresso das metas
    };
  }

  private atualizarAlertas(dashboardData: DashboardCompleto): void {
    const alertas: AlertaFinanceiro[] = [];
    
    // Alertas de metas
    dashboardData.metas.forEach(meta => {
      if (meta.progresso.percentual >= 100) {
        alertas.push({
          id: `meta-${meta.id}`,
          tipo: 'meta-concluida',
          nivel: 'success',
          titulo: 'Meta Concluída',
          descricao: `Meta "${meta.titulo}" foi alcançada!`,
          data: new Date()
        });
      } else if (meta.probabilidadeSucesso < 50) {
        alertas.push({
          id: `meta-risco-${meta.id}`,
          tipo: 'meta-em-risco',
          nivel: 'warning',
          titulo: 'Meta em Risco',
          descricao: `Meta "${meta.titulo}" com baixa probabilidade de sucesso`,
          acao: 'Ver detalhes',
          data: new Date()
        });
      }
    });
    
    // Alertas de pagamentos
    if (dashboardData.resumoFinanceiro.statusPagamentos.pendente > 0) {
      alertas.push({
        id: 'pagamentos-pendentes',
        tipo: 'pagamento-pendente',
        nivel: 'info',
        titulo: 'Pagamentos Pendentes',
        descricao: `R$ ${dashboardData.resumoFinanceiro.statusPagamentos.pendente.toFixed(2)} aguardando pagamento`,
        acao: 'Ver detalhes',
        data: new Date()
      });
    }
    
    this._alertas.next(alertas);
  }

  // Métodos públicos para interação
  public obterDashboardData(): Observable<DashboardCompleto | null> {
    return this.dashboardData$;
  }

  public obterAlertas(): Observable<AlertaFinanceiro[]> {
    return this.alertas$;
  }

  public forcarAtualizacao(): void {
    // Força uma nova emissão dos dados
    this.inicializarIntegracao();
  }
}
