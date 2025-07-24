import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Policial {
  id: string;
  nome: string;
  posto: string;
  matricula: string;
  unidade: string;
}

export interface ServicoOrdinario {
  id: string;
  policial: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  tipo: 'expediente' | 'plantao' | 'escala';
  status: 'agendado' | 'em-andamento' | 'concluido' | 'cancelado';
  observacoes: string;
}

export interface ServicoRAS {
  id: string;
  status: 'agendado' | 'em-andamento' | 'concluido' | 'cancelado';
  posto: string;
  turno: string;
  duracao: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: 'voluntario' | 'compulsorio';
  modalidade: 'titular' | 'reserva';
  projeto: 'ServControl' | 'CPROEIS';
  local: string;
  observacoes: string;
  valorHora: number;
  valorTotal: number;
  valorAlimentacao: number;
  valorTransporte: number;
  valorFinal: number;
  policial?: string;
}

export interface TrocaServico {
  id: string;
  tipo: 'ordinario' | 'ras-compulsorio';
  policialOriginal: string;
  policialSubstituto: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  posto?: string; // Para RAS
  duracao?: number; // Para RAS
  valorBase?: number; // Só para RAS (valor da tabela)
  valorTransporte?: number; // Só para RAS
  valorAcordado: number;
  valorFinal: number;
  status: 'pendente' | 'confirmada' | 'cancelada';
  observacoes: string;
  servicoOriginalId?: string; // Referência ao serviço que foi trocado
}

export interface ConflictInfo {
  policial: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  servicos: string[];
}

export interface TabelaValoresFixos {
  [posto: string]: {
    [duracao: number]: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ServicosDataService {
  
  // BehaviorSubjects para dados reativos
  private _policiais = new BehaviorSubject<Policial[]>([]);
  private _servicosOrdinarios = new BehaviorSubject<ServicoOrdinario[]>([]);
  private _servicosRAS = new BehaviorSubject<ServicoRAS[]>([]);
  private _trocas = new BehaviorSubject<TrocaServico[]>([]);
  private _conflitos = new BehaviorSubject<ConflictInfo[]>([]);

  // Observables públicos
  public policiais$ = this._policiais.asObservable();
  public servicosOrdinarios$ = this._servicosOrdinarios.asObservable();
  public servicosRAS$ = this._servicosRAS.asObservable();
  public trocas$ = this._trocas.asObservable();
  public conflitos$ = this._conflitos.asObservable();

  // Dados compartilhados
  public locais: string[] = ['1º BPM', '2º BPM', '3º BPM', '4º BPM', '5º BPM', 'CPE', 'BOPE', 'COE'];
  public valorTransporte = 13.00;
  public valorAlimentacao = 22.50;

  // Tabela de valores fixos para RAS
  public tabelaValoresFixos: TabelaValoresFixos = {
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

  constructor() {
    this.carregarDadosIniciais();
  }

  private carregarDadosIniciais(): void {
    // Mock de policiais
    const policiais: Policial[] = [
      { id: '1', nome: 'João Silva', posto: 'Soldado', matricula: '123456', unidade: '1º BPM' },
      { id: '2', nome: 'Maria Santos', posto: 'Cabo', matricula: '234567', unidade: '2º BPM' },
      { id: '3', nome: 'Pedro Costa', posto: 'Sargento', matricula: '345678', unidade: '3º BPM' },
      { id: '4', nome: 'Ana Oliveira', posto: 'Tenente', matricula: '456789', unidade: '1º BPM' },
      { id: '5', nome: 'Carlos Lima', posto: 'Capitão', matricula: '567890', unidade: '2º BPM' }
    ];

    // Mock de serviços RAS correspondentes aos dados financeiros
    const servicosRAS: ServicoRAS[] = [
      {
        id: 'ras-001',
        status: 'concluido',
        posto: 'Soldado',
        turno: 'Diurno',
        duracao: 6,
        data: '2025-01-15',
        horaInicio: '06:00',
        horaFim: '12:00',
        tipo: 'voluntario',
        modalidade: 'titular',
        projeto: 'ServControl',
        local: '1º BPM',
        observacoes: 'Serviço de patrulhamento',
        valorHora: 65,
        valorTotal: 390,
        valorAlimentacao: 22.50,
        valorTransporte: 13.00,
        valorFinal: 425.50,
        policial: 'João Silva'
      },
      {
        id: 'ras-002',
        status: 'concluido',
        posto: 'Cabo',
        turno: 'Noturno',
        duracao: 8,
        data: '2025-01-18',
        horaInicio: '18:00',
        horaFim: '02:00',
        tipo: 'voluntario',
        modalidade: 'titular',
        projeto: 'CPROEIS',
        local: 'Shopping Center',
        observacoes: 'Projeto especial - evento',
        valorHora: 85,
        valorTotal: 680,
        valorAlimentacao: 22.50,
        valorTransporte: 13.00,
        valorFinal: 715.50,
        policial: 'Maria Santos'
      },
      {
        id: 'ras-003',
        status: 'concluido',
        posto: 'Sargento',
        turno: 'Integral',
        duracao: 12,
        data: '2025-01-20',
        horaInicio: '06:00',
        horaFim: '18:00',
        tipo: 'compulsorio',
        modalidade: 'titular',
        projeto: 'ServControl',
        local: '3º BPM',
        observacoes: 'Serviço compulsório',
        valorHora: 45,
        valorTotal: 540,
        valorAlimentacao: 22.50,
        valorTransporte: 13.00,
        valorFinal: 575.50,
        policial: 'Pedro Costa'
      },
      {
        id: 'ras-004',
        status: 'concluido',
        posto: 'Tenente',
        turno: 'Integral',
        duracao: 12,
        data: '2025-01-22',
        horaInicio: '18:00',
        horaFim: '06:00',
        tipo: 'compulsorio',
        modalidade: 'reserva',
        projeto: 'ServControl',
        local: '1º BPM',
        observacoes: 'Troca compulsória',
        valorHora: 40,
        valorTotal: 480,
        valorAlimentacao: 22.50,
        valorTransporte: 13.00,
        valorFinal: 515.50,
        policial: 'Ana Oliveira'
      }
    ];

    // Mock de trocas correspondentes aos dados financeiros  
    const trocas: TrocaServico[] = [
      {
        id: '1',
        tipo: 'ordinario',
        policialOriginal: 'Carlos Lima',
        policialSubstituto: 'João Silva',
        data: '2025-01-10',
        horaInicio: '06:00',
        horaFim: '14:00',
        duracao: 8,
        local: '2º BPM',
        valorAcordado: 280.00,
        valorFinal: 280.00,
        observacoes: 'Troca confirmada - ordinário',
        status: 'confirmada',
        servicoOriginalId: 'ord-001'
      },
      {
        id: '2',
        tipo: 'ordinario',
        policialOriginal: 'Lucia Ferreira',
        policialSubstituto: 'Maria Santos',
        data: '2025-01-12',
        horaInicio: '14:00',
        horaFim: '20:00',
        duracao: 6,
        local: 'Projeto Especial',
        valorAcordado: 252.00,
        valorFinal: 252.00,
        observacoes: 'Projeto especial - troca',
        status: 'confirmada',
        servicoOriginalId: 'ord-002'
      },
      {
        id: '3',
        tipo: 'ras-compulsorio',
        policialOriginal: 'Roberto Souza',
        policialSubstituto: 'Pedro Costa',
        data: '2025-01-25',
        horaInicio: '06:00',
        horaFim: '06:00',
        duracao: 24,
        local: '3º BPM',
        posto: 'Sargento',
        valorBase: 1080.00,
        valorTransporte: 26.00,
        valorAcordado: 200.00,
        valorFinal: 1306.00,
        observacoes: 'RAS compulsório - 24h',
        status: 'confirmada',
        servicoOriginalId: 'ras-005'
      }
    ];

    this._policiais.next(policiais);
    this._servicosRAS.next(servicosRAS);
    this._trocas.next(trocas);
  }

  // Métodos para Policiais
  getPoliciais(): Policial[] {
    return this._policiais.value;
  }

  // Métodos para Serviços Ordinários
  getServicosOrdinarios(): ServicoOrdinario[] {
    return this._servicosOrdinarios.value;
  }

  addServicoOrdinario(servico: ServicoOrdinario): void {
    const servicos = [...this._servicosOrdinarios.value, servico];
    this._servicosOrdinarios.next(servicos);
    this.verificarConflitos();
  }

  updateServicoOrdinario(servico: ServicoOrdinario): void {
    const servicos = this._servicosOrdinarios.value.map(s => 
      s.id === servico.id ? servico : s
    );
    this._servicosOrdinarios.next(servicos);
    this.verificarConflitos();
  }

  deleteServicoOrdinario(id: string): void {
    const servicos = this._servicosOrdinarios.value.filter(s => s.id !== id);
    this._servicosOrdinarios.next(servicos);
    this.verificarConflitos();
  }

  // Métodos para Serviços RAS
  getServicosRAS(): ServicoRAS[] {
    return this._servicosRAS.value;
  }

  addServicoRAS(servico: ServicoRAS): void {
    const servicos = [...this._servicosRAS.value, servico];
    this._servicosRAS.next(servicos);
    this.verificarConflitos();
  }

  updateServicoRAS(servico: ServicoRAS): void {
    const servicos = this._servicosRAS.value.map(s => 
      s.id === servico.id ? servico : s
    );
    this._servicosRAS.next(servicos);
    this.verificarConflitos();
  }

  deleteServicoRAS(id: string): void {
    const servicos = this._servicosRAS.value.filter(s => s.id !== id);
    this._servicosRAS.next(servicos);
    this.verificarConflitos();
  }

  // Métodos para Trocas
  getTrocas(): TrocaServico[] {
    return this._trocas.value;
  }

  addTroca(troca: TrocaServico): void {
    const trocas = [...this._trocas.value, troca];
    this._trocas.next(trocas);
    this.verificarConflitos();
  }

  updateTroca(troca: TrocaServico): void {
    const trocas = this._trocas.value.map(t => 
      t.id === troca.id ? troca : t
    );
    this._trocas.next(trocas);
    this.verificarConflitos();
  }

  deleteTroca(id: string): void {
    const trocas = this._trocas.value.filter(t => t.id !== id);
    this._trocas.next(trocas);
    this.verificarConflitos();
  }

  // Método para calcular valor de troca RAS
  calcularValorTrocaRAS(posto: string, duracao: number, valorAcordado: number): number {
    const valorBase = this.tabelaValoresFixos[posto]?.[duracao] || 0;
    return valorBase + this.valorTransporte + valorAcordado;
  }

  // Método para verificar conflitos
  private verificarConflitos(): void {
    const conflitos: ConflictInfo[] = [];
    const todosServicos = this.obterTodosServicos();

    // Agrupar por policial e data
    const servicosPorPolicialData: { [key: string]: any[] } = {};

    todosServicos.forEach(servico => {
      const policial = servico.policial || servico.policialOriginal || servico.policialSubstituto;
      const key = `${policial}-${servico.data}`;
      
      if (!servicosPorPolicialData[key]) {
        servicosPorPolicialData[key] = [];
      }
      servicosPorPolicialData[key].push(servico);
    });

    // Verificar sobreposições
    Object.keys(servicosPorPolicialData).forEach(key => {
      const servicos = servicosPorPolicialData[key];
      if (servicos.length > 1) {
        for (let i = 0; i < servicos.length; i++) {
          for (let j = i + 1; j < servicos.length; j++) {
            if (this.verificarSobreposicao(servicos[i], servicos[j])) {
              const [policial, data] = key.split('-');
              conflitos.push({
                policial,
                data,
                horaInicio: servicos[i].horaInicio,
                horaFim: servicos[i].horaFim,
                servicos: [servicos[i].id, servicos[j].id]
              });
            }
          }
        }
      }
    });

    this._conflitos.next(conflitos);
  }

  private verificarSobreposicao(servico1: any, servico2: any): boolean {
    const inicio1 = new Date(`2000-01-01T${servico1.horaInicio}`);
    const fim1 = new Date(`2000-01-01T${servico1.horaFim}`);
    const inicio2 = new Date(`2000-01-01T${servico2.horaInicio}`);
    const fim2 = new Date(`2000-01-01T${servico2.horaFim}`);

    return inicio1 < fim2 && inicio2 < fim1;
  }

  // Método para obter todos os serviços unificados
  obterTodosServicos(): any[] {
    const ordinarios = this._servicosOrdinarios.value.map(s => ({
      ...s,
      tipoServico: 'ordinario'
    }));

    const ras = this._servicosRAS.value.map(s => ({
      ...s,
      tipoServico: s.tipo === 'voluntario' ? 'ras-voluntario' : 'ras-compulsorio',
      policial: s.policial || `${s.posto} - ${s.local}`
    }));

    const trocas = this._trocas.value.map(t => ({
      ...t,
      tipoServico: t.tipo === 'ordinario' ? 'troca-ordinario' : 'troca-ras',
      policial: t.policialSubstituto
    }));

    return [...ordinarios, ...ras, ...trocas];
  }

  // Método que pode ser usado pelos componentes para obter estatísticas
  obterEstatisticasGlobais() {
    const todosServicos = this.obterTodosServicos();
    const conflitos = this._conflitos.value;

    return {
      totalServicos: todosServicos.length,
      servicosOrdinarios: this._servicosOrdinarios.value.length,
      servicosRAS: this._servicosRAS.value.length,
      trocas: this._trocas.value.length,
      conflitos: conflitos.length,
      policaisAtivos: new Set(todosServicos.map(s => s.policial)).size
    };
  }

  // Método para obter serviços RAS compulsórios disponíveis para troca
  getRASCompulsorioDisponiveis(): ServicoRAS[] {
    return this._servicosRAS.value.filter(s => 
      s.tipo === 'compulsorio' && 
      s.status === 'agendado' &&
      !this._trocas.value.some(t => t.servicoOriginalId === s.id)
    );
  }

  // Novos métodos para o Dashboard
  obterServicosPorPeriodo(inicio: Date, fim: Date): any[] {
    const inicioStr = inicio.toISOString().split('T')[0];
    const fimStr = fim.toISOString().split('T')[0];
    
    return this.obterTodosServicos().filter(servico => {
      return servico.data >= inicioStr && servico.data <= fimStr;
    });
  }

  obterTrocasPorPeriodo(inicio: Date, fim: Date): TrocaServico[] {
    const inicioStr = inicio.toISOString().split('T')[0];
    const fimStr = fim.toISOString().split('T')[0];
    
    return this._trocas.value.filter(troca => {
      return troca.data >= inicioStr && troca.data <= fimStr;
    });
  }

  obterTodasTrocas(): TrocaServico[] {
    return this._trocas.value;
  }

  // Observables para serviços
  get servicos$(): Observable<any[]> {
    return new BehaviorSubject(this.obterTodosServicos()).asObservable();
  }

  // Método para atualizar perfil do usuário (pode ser expandido)
  atualizarPerfilUsuario(perfil: any): void {
    // Por enquanto apenas emite evento para outros componentes
    console.log('Perfil atualizado:', perfil);
    // Aqui poderia ter lógica para notificar outros componentes
  }
}
