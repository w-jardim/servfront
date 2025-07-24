import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CronogramaUnificadoComponent, ServicoAgendado, ConflictInfo } from '../../shared/cronograma-unificado/cronograma-unificado.component';
import { CadastroRasComponent, ServicoRAS, TabelaValores, TabelaValoresFixos } from '../../formulario/cadastro-ras.component/cadastro-ras.component';


export interface EscalaPolicial {
  policial: string;
  escala: '12x36' | '24x72' | 'expediente';
  cicloInicio: Date;
  diasTrabalho: number[];
  primeiraFolga: Date[];
  segundaFolga: Date[];
}

@Component({
  selector: 'app-ras',
  standalone: true,
  imports: [CommonModule, CronogramaUnificadoComponent, CadastroRasComponent],
  templateUrl: './ras.component.html',
  styleUrl: './ras.component.scss'
})
export class RasComponent implements OnInit {
  servicos: ServicoRAS[] = [];
  tiposExibicao: ('ordinario' | 'ras-voluntario' | 'ras-compulsorio')[] = ['ras-voluntario', 'ras-compulsorio'];
  modoVisualizacao: 'semanal' | 'mensal' = 'semanal';
  dataAtual = new Date();
  
  mostrarModalCadastro = false;
  servicoEdicao: ServicoRAS | null = null;
  dataSelecionada: Date | null = null;
  horaSelecionada: string | null = null;
  
  conflitosDetectados: ConflictInfo[] = [];
  
  // Tabela de valores RAS (valores fixos por posto e duração)
  tabelaValoresFixos: TabelaValoresFixos = {
    'Soldado': { 6: 168.55, 8: 222.06, 12: 333.09 },
    'Cabo': { 6: 168.55, 8: 222.06, 12: 333.09 },
    'Sargento': { 6: 168.55, 8: 222.06, 12: 333.09 },
    'Subtenente': { 6: 168.55, 8: 222.06, 12: 333.09 },
    'Tenente': { 6: 222.26, 8: 298.08, 12: 444.12 },
    'Capitão': { 6: 222.26, 8: 298.08, 12: 444.12 },
    'Major': { 6: 277.58, 8: 370.10, 12: 555.16 },
    'Tenente-Coronel': { 6: 277.58, 8: 370.10, 12: 555.16 },
    'Coronel': { 6: 277.58, 8: 370.10, 12: 555.16 }
  };

  // Tabela de valores por hora (apenas para exibição)
  tabelaValores: TabelaValores = {
    'Soldado': {
      'Diurno': { servcontrol: 15.50, cproeis: 18.60 },
      'Noturno': { servcontrol: 17.05, cproeis: 20.46 }
    },
    'Cabo': {
      'Diurno': { servcontrol: 16.12, cproeis: 19.34 },
      'Noturno': { servcontrol: 17.73, cproeis: 21.28 }
    },
    'Sargento': {
      'Diurno': { servcontrol: 16.74, cproeis: 20.09 },
      'Noturno': { servcontrol: 18.41, cproeis: 22.09 }
    },
    'Subtenente': {
      'Diurno': { servcontrol: 17.36, cproeis: 20.83 },
      'Noturno': { servcontrol: 19.10, cproeis: 22.92 }
    },
    'Tenente': {
      'Diurno': { servcontrol: 17.98, cproeis: 21.58 },
      'Noturno': { servcontrol: 19.78, cproeis: 23.74 }
    },
    'Capitão': {
      'Diurno': { servcontrol: 18.60, cproeis: 22.32 },
      'Noturno': { servcontrol: 20.46, cproeis: 24.55 }
    },
    'Major': {
      'Diurno': { servcontrol: 19.22, cproeis: 23.06 },
      'Noturno': { servcontrol: 21.14, cproeis: 25.37 }
    },
    'Tenente-Coronel': {
      'Diurno': { servcontrol: 19.84, cproeis: 23.81 },
      'Noturno': { servcontrol: 21.82, cproeis: 26.19 }
    },
    'Coronel': {
      'Diurno': { servcontrol: 20.46, cproeis: 24.55 },
      'Noturno': { servcontrol: 22.51, cproeis: 27.01 }
    }
  };
  
  valorAlimentacao = 22.50;
  valorTransporte = 13.00;
  limiteHorasMensal = 120;
  
  // Estatísticas
  estatisticas = {
    horasUsadas: 0,
    limiteHoras: 120,
    valorAcumulado: 0,
    servicosAgendados: 0,
    titulares: 0,
    reservas: 0,
    conflitosAtivos: 0
  };

  ngOnInit() {
    this.carregarServicos();
    this.calcularEstatisticas();
  }

  private carregarServicos() {
    // Dados mock - em produção viria de um serviço
    this.servicos = [
      {
        id: '1',
        status: 'agendado',
        posto: 'Soldado',
        turno: 'Diurno',
        duracao: 8,
        data: new Date().toISOString().split('T')[0],
        horaInicio: '14:00',
        horaFim: '22:00',
        tipo: 'voluntario',
        modalidade: 'titular',
        projeto: 'CPROEIS',
        local: '1º BPM',
        observacoes: 'Patrulhamento especial',
        valorHora: 18.60,  // Valor por hora para exibição
        valorTotal: 222.06,  // Valor fixo da tabela
        valorAlimentacao: 22.50,
        valorTransporte: 13.00,
        valorFinal: 257.56  // 222.06 + 22.50 + 13.00
      },
      {
        id: '2',
        status: 'agendado',
        posto: 'Cabo',
        turno: 'Diurno',
        duracao: 12,
        data: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        horaInicio: '06:00',
        horaFim: '18:00',
        tipo: 'compulsorio',
        modalidade: 'titular',
        projeto: 'ServControl',
        local: '2º BPM',
        observacoes: 'Operação de saturação',
        valorHora: 16.12,  // Valor por hora para exibição
        valorTotal: 333.09,  // Valor fixo da tabela para 12h
        valorAlimentacao: 0,
        valorTransporte: 13.00,
        valorFinal: 346.09  // 333.09 + 0 + 13.00
      },
      {
        id: '3',
        status: 'agendado',
        posto: 'Soldado',
        turno: 'Noturno',
        duracao: 8,
        data: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        horaInicio: '18:00',
        horaFim: '02:00',
        tipo: 'voluntario',
        modalidade: 'reserva',
        projeto: 'ServControl',
        local: '3º BPM',
        observacoes: 'Patrulhamento noturno',
        valorHora: 17.05,  // Valor por hora para exibição
        valorTotal: 222.06,  // Valor fixo da tabela
        valorAlimentacao: 0,
        valorTransporte: 13.00,
        valorFinal: 235.06  // 222.06 + 0 + 13.00
      }
    ];
  }

  private calcularEstatisticas() {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    const servicosMes = this.servicos.filter(s => {
      const dataServico = new Date(s.data);
      return dataServico >= inicioMes && dataServico <= fimMes;
    });
    
    let horasUsadas = 0;
    let valorAcumulado = 0;
    let titulares = 0;
    let reservas = 0;
    
    servicosMes.forEach(servico => {
      horasUsadas += servico.duracao;
      valorAcumulado += servico.valorFinal;
      
      if (servico.modalidade === 'titular') {
        titulares++;
      } else {
        reservas++;
      }
    });
    
    this.estatisticas = {
      horasUsadas,
      limiteHoras: this.limiteHorasMensal,
      valorAcumulado,
      servicosAgendados: servicosMes.length,
      titulares,
      reservas,
      conflitosAtivos: this.conflitosDetectados.length
    };
  }

  calcularValorRAS(servico: Partial<ServicoRAS>): number {
    if (!servico.posto || !servico.turno || !servico.duracao || !servico.projeto) return 0;
    
    // Usar tabela de valores fixos
    const valorBase = this.tabelaValoresFixos[servico.posto]?.[servico.duracao];
    if (!valorBase) return 0;
    
    // Adicionar alimentação se for CPROEIS
    const alimentacao = servico.projeto === 'CPROEIS' ? this.valorAlimentacao : 0;
    const transporte = this.valorTransporte;
    
    return valorBase + alimentacao + transporte;
  }

  // Método para obter valor por hora (apenas para exibição)
  obterValorPorHora(servico: Partial<ServicoRAS>): number {
    if (!servico.posto || !servico.turno || !servico.projeto) return 0;
    
    const valores = this.tabelaValores[servico.posto]?.[servico.turno];
    if (!valores) return 0;
    
    return servico.projeto === 'CPROEIS' ? valores.cproeis : valores.servcontrol;
  }

  validarRASCompulsorio(policial: string, data: Date, horaInicio: string): { valido: boolean; motivo?: string } {
    // Simulação de validação - em produção consultaria a escala real
    const escala = this.getEscalaPolicial(policial);
    
    // Verificar se é segunda folga
    const isSegundaFolga = this.isSegundaFolga(escala, data);
    if (isSegundaFolga) {
      return {
        valido: false,
        motivo: 'RAS Compulsório não permitido na segunda folga'
      };
    }
    
    // Verificar regra das 8h
    const violaDescanso = this.verificarDescanso8h(policial, data, horaInicio);
    if (violaDescanso) {
      return {
        valido: false,
        motivo: 'Deve respeitar 8h de descanso do serviço anterior'
      };
    }
    
    return { valido: true };
  }

  private getEscalaPolicial(policial: string): EscalaPolicial {
    // Mock - em produção viria do backend
    return {
      policial,
      escala: '12x36',
      cicloInicio: new Date(),
      diasTrabalho: [1, 2, 4, 5], // segunda, terça, quinta, sexta
      primeiraFolga: [new Date(2024, 6, 16)], // 16/07
      segundaFolga: [new Date(2024, 6, 15)] // 15/07
    };
  }

  private isSegundaFolga(escala: EscalaPolicial, data: Date): boolean {
    return escala.segundaFolga.some(folga => 
      folga.toDateString() === data.toDateString()
    );
  }

  private verificarDescanso8h(policial: string, data: Date, horaInicio: string): boolean {
    // Simulação - em produção verificaria serviços reais do policial específico
    // Por ora, sempre válido para demo
    return true;
  }

  onServicoClicado(servico: ServicoAgendado) {
    // Converter ServicoAgendado para ServicoRAS se for um serviço RAS
    if (servico.tipo?.includes('ras')) {
      this.servicoEdicao = this.servicos.find(s => s.id === servico.id) || null;
      this.mostrarModalCadastro = true;
    }
  }

  onNovoServico(evento: {data: Date, hora: string}) {
    this.dataSelecionada = evento.data;
    this.horaSelecionada = evento.hora;
    this.servicoEdicao = null;
    this.mostrarModalCadastro = true;
  }

  onConflitosDetectados(conflitos: ConflictInfo[]) {
    this.conflitosDetectados = conflitos;
    this.estatisticas.conflitosAtivos = conflitos.length;
  }

  onServicoSalvo(servico: ServicoRAS) {
    if (this.servicoEdicao) {
      // Edição
      const index = this.servicos.findIndex(s => s.id === servico.id);
      if (index !== -1) {
        this.servicos[index] = servico;
      }
    } else {
      // Novo serviço
      servico.id = Date.now().toString();
      this.servicos.push(servico);
    }
    
    this.fecharModal();
    this.calcularEstatisticas();
  }

  onServicoExcluido(id: string) {
    this.servicos = this.servicos.filter(s => s.id !== id);
    this.fecharModal();
    this.calcularEstatisticas();
  }

  fecharModal() {
    this.mostrarModalCadastro = false;
    this.servicoEdicao = null;
    this.dataSelecionada = null;
    this.horaSelecionada = null;
  }

  alternarTipoExibicao(tipo: 'ordinario' | 'ras-voluntario' | 'ras-compulsorio') {
    const index = this.tiposExibicao.indexOf(tipo);
    if (index === -1) {
      this.tiposExibicao.push(tipo);
    } else {
      // Manter pelo menos um tipo sempre visível
      if (this.tiposExibicao.length > 1) {
        this.tiposExibicao.splice(index, 1);
      }
    }
  }

  alternarModoVisualizacao() {
    this.modoVisualizacao = this.modoVisualizacao === 'semanal' ? 'mensal' : 'semanal';
  }

  exportarCronograma() {
    console.log('Exportar cronograma RAS');
  }

  imprimirCronograma() {
    window.print();
  }

  getProgressoHoras(): number {
    return Math.min((this.estatisticas.horasUsadas / this.estatisticas.limiteHoras) * 100, 100);
  }

  getCorProgressoHoras(): string {
    const progresso = this.getProgressoHoras();
    if (progresso >= 90) return '#dc3545'; // Vermelho
    if (progresso >= 75) return '#ffc107'; // Amarelo
    return '#28a745'; // Verde
  }

  getDataSelecionadaString(): string {
    return this.dataSelecionada ? this.dataSelecionada.toISOString().split('T')[0] : '';
  }

  getHoraSelecionadaString(): string {
    return this.horaSelecionada || '';
  }

  // Converte ServicoRAS para ServicoAgendado para compatibilidade com cronograma
  getServicosParaCronograma(): ServicoAgendado[] {
    return this.servicos.map(servico => ({
      id: servico.id,
      tipo: servico.tipo === 'voluntario' ? 'ras-voluntario' : 'ras-compulsorio',
      status: servico.status,
      data: new Date(servico.data),
      horaInicio: servico.horaInicio,
      horaFim: servico.horaFim,
      policial: `${servico.posto} - ${servico.local}`, // Usar informações disponíveis
      local: servico.local,
      observacoes: servico.observacoes
    }));
  }
}
