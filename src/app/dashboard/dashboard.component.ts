import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ServicosDataService } from '../shared/services/servicos-data.service';
import { ConflictValidationService } from '../shared/services/conflict-validation.service';
import { 
  DashboardIntegrationService, 
  DashboardCompleto, 
  ResumoFinanceiroCompleto, 
  MetaComProgresso, 
  AlertaFinanceiro,
  EventoCalendario
} from '../shared/services/dashboard-integration.service';

export interface PerfilUsuario {
  id: string;
  nomeCompleto: string;
  nomeEscala?: string;
  posto: string;
  unidade: string;
  salarioBase?: number;
  avatar?: string;
  configuracoes: {
    autoPreencherNome: boolean;
    autoPreencherUnidade: boolean;
    aplicarTabelaValores: boolean;
    calcularAutomaticamente: boolean;
    exibirValorOrdinario: boolean;
    usarCoresSobrepostasAlternativas: boolean;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  perfilUsuario: PerfilUsuario = {
    id: '1',
    nomeCompleto: '',
    nomeEscala: '',
    posto: '',
    unidade: '',
    salarioBase: 0,
    avatar: '',
    configuracoes: {
      autoPreencherNome: true,
      autoPreencherUnidade: true,
      aplicarTabelaValores: true,
      calcularAutomaticamente: true,
      exibirValorOrdinario: false,
      usarCoresSobrepostasAlternativas: false
    }
  };

  resumoFinanceiro: ResumoFinanceiroCompleto = {
    rasVoluntario: { valor: 0, quantidade: 0 },
    rasCompulsorio: { valor: 0, quantidade: 0 },
    trocas: {
      ordinarias: { valor: 0, quantidade: 0 },
      rasCompulsorio: { valor: 0, quantidade: 0 },
      total: 0
    },
    totalGeral: 0,
    comparativoMesAnterior: { crescimento: 0, diferenca: 0 },
    projecaoMensal: { valorEstimado: 0, baseadoEm: 'sem-dados' },
    statusPagamentos: { pago: 0, pendente: 0, processando: 0 }
  };

  // Dados integrados
  dashboardData: DashboardCompleto | null = null;
  metasComProgresso: MetaComProgresso[] = [];
  alertasAtivos: AlertaFinanceiro[] = [];

  // Calendário
  dataAtual = new Date();
  mesAtual = new Date();
  diasCalendario: EventoCalendario[] = [];
  
  // Estados da interface
  editandoPerfil = false;
  modoEdicao = false;
  
  // Dados
  postos = ['Soldado', 'Cabo', 'Sargento', 'Subtenente', 'Tenente', 'Capitão', 'Major', 'Tenente-Coronel', 'Coronel'];
  
  // Cores por tipo de serviço
  coresServicos: { [key: string]: string } = {
    'ordinario': '#4A90E2',           // Azul
    'ras-voluntario': '#7ED321',      // Verde
    'ras-compulsorio': '#F5A623',     // Laranja
    'troca-ordinario': '#9013FE',     // Roxo
    'troca-ras': '#BD10E0',           // Magenta
    'conflito': '#D0021B'             // Vermelho para conflitos
  };

  // Cores alternativas (mais suaves)
  coresAlternativas: { [key: string]: string } = {
    'ordinario': '#B3D9FF',           // Azul claro
    'ras-voluntario': '#C8E6C9',      // Verde claro
    'ras-compulsorio': '#FFE0B2',     // Laranja claro
    'troca-ordinario': '#E1BEE7',     // Roxo claro
    'troca-ras': '#F8BBD9',           // Rosa claro
    'conflito': '#FFCDD2'             // Vermelho claro
  };
  
  private subscriptions: Subscription[] = [];

  constructor(
    private servicosDataService: ServicosDataService,
    private dashboardIntegrationService: DashboardIntegrationService,
    private conflictValidationService: ConflictValidationService
  ) {}

  ngOnInit() {
    this.carregarPerfilUsuario();
    this.subscribeToIntegratedData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToIntegratedData(): void {
    // Subscribe aos dados integrados do dashboard
    this.subscriptions.push(
      this.dashboardIntegrationService.obterDashboardData().subscribe(data => {
        if (data) {
          this.dashboardData = data;
          this.atualizarDashboardComDados(data);
        }
      })
    );

    // Subscribe aos alertas
    this.subscriptions.push(
      this.dashboardIntegrationService.obterAlertas().subscribe(alertas => {
        this.alertasAtivos = alertas;
      })
    );
  }

  private atualizarDashboardComDados(data: DashboardCompleto): void {
    // Atualizar resumo financeiro
    this.resumoFinanceiro = data.resumoFinanceiro;
    
    // Adicionar salário base se configurado
    if (this.perfilUsuario.salarioBase && this.perfilUsuario.salarioBase > 0) {
      this.resumoFinanceiro.ordinario = {
        salarioBase: this.perfilUsuario.salarioBase,
        exibir: true
      };
      // Recalcular total incluindo salário base
      this.resumoFinanceiro.totalGeral += this.perfilUsuario.salarioBase;
    }

    // Atualizar metas
    this.metasComProgresso = data.metas;
    
    // Atualizar calendário
    this.diasCalendario = data.calendario;
  }

  carregarPerfilUsuario(): void {
    // Perfil padrão
    const perfilPadrao: PerfilUsuario = {
      id: '1',
      nomeCompleto: 'João Silva Santos',
      nomeEscala: 'João Silva',
      posto: 'Soldado',
      unidade: '1º Batalhão de Polícia Militar',
      salarioBase: 6500.00,
      avatar: '',
      configuracoes: {
        autoPreencherNome: true,
        autoPreencherUnidade: true,
        aplicarTabelaValores: true,
        calcularAutomaticamente: true,
        exibirValorOrdinario: false,
        usarCoresSobrepostasAlternativas: false
      }
    };

    // Tentar carregar do localStorage
    const perfilSalvo = localStorage.getItem('perfilUsuario');
    if (perfilSalvo) {
      try {
        const perfilCarregado = JSON.parse(perfilSalvo);
        // Mesclar com padrões para garantir que todas as propriedades existam
        this.perfilUsuario = {
          ...perfilPadrao,
          ...perfilCarregado,
          configuracoes: {
            ...perfilPadrao.configuracoes,
            ...perfilCarregado.configuracoes
          }
        };
      } catch (error) {
        console.warn('Erro ao carregar perfil do localStorage, usando padrão:', error);
        this.perfilUsuario = perfilPadrao;
      }
    } else {
      // Usar dados mock padrão
      this.perfilUsuario = perfilPadrao;
    }
  }

  salvarPerfil(): void {
    // Validações básicas
    if (!this.perfilUsuario.nomeCompleto.trim()) {
      alert('Nome completo é obrigatório');
      return;
    }
    if (!this.perfilUsuario.posto) {
      alert('Posto/Graduação é obrigatório');
      return;
    }
    if (!this.perfilUsuario.unidade.trim()) {
      alert('Unidade é obrigatória');
      return;
    }

    // Salvar no localStorage
    localStorage.setItem('perfilUsuario', JSON.stringify(this.perfilUsuario));
    
    // Recalcular resumo com novo perfil
    this.recalcularComPerfilAtualizado();
    
    this.editandoPerfil = false;
    
    // Notificar outros componentes sobre mudança no perfil
    this.servicosDataService.atualizarPerfilUsuario(this.perfilUsuario);
  }

  editarPerfil(): void {
    this.editandoPerfil = true;
  }

  cancelarEdicao(): void {
    this.carregarPerfilUsuario(); // Restaurar dados
    this.editandoPerfil = false;
  }

  // Método para forçar recalculo quando perfil muda
  private recalcularComPerfilAtualizado(): void {
    if (this.dashboardData) {
      this.atualizarDashboardComDados(this.dashboardData);
    }
  }

  navegarMes(direcao: number): void {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() + direcao, 1);
    // Forçar atualização dos dados do dashboard para o novo mês
    this.dashboardIntegrationService.forcarAtualizacao();
  }

  getNomeMes(): string {
    return this.mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  getDiaSemana(data: Date): string {
    return data.toLocaleDateString('pt-BR', { weekday: 'short' });
  }

  getDetalhesTooltip(evento: EventoCalendario): string {
    if (!evento.temServicos) return '';
    
    let detalhes = '';
    evento.servicos.forEach(servico => {
      const tipo = this.formatarTipoServico(servico.tipoServico || servico.tipo);
      const valor = servico.valorTotal || servico.valorFinal || 0;
      const horario = servico.horaInicio && servico.horaFim ? 
        ` (${servico.horaInicio}-${servico.horaFim})` : '';
      detalhes += `• ${tipo}${horario}: R$ ${valor.toFixed(2)}\n`;
    });
    
    if (evento.temConflito) {
      detalhes += '\n⚠️ CONFLITO DE HORÁRIOS DETECTADO!';
    }
    
    if (evento.statusFinanceiro === 'pendente') {
      detalhes += '\n💰 Pagamento Pendente';
    } else if (evento.statusFinanceiro === 'processando') {
      detalhes += '\n⏳ Processando Pagamento';
    } else if (evento.statusFinanceiro === 'pago') {
      detalhes += '\n✅ Pago';
    }
    
    return detalhes;
  }

  getEstiloDia(evento: EventoCalendario): { [key: string]: string } {
    if (!evento.temServicos) return {};
    
    const coresAtivas = this.getCoresAtivas();
    
    if (evento.temConflito) {
      return this.getEstiloConflito(evento.coresServicos, coresAtivas);
    }
    
    if (evento.coresServicos.length === 1) {
      // Um único tipo de serviço
      const cor = this.mapearCorPorTipo(evento.tiposServicos[0], coresAtivas);
      const opacity = evento.statusFinanceiro === 'pago' ? '25' : '15';
      
      // Tratamento especial para ordinário
      if (evento.tiposServicos[0] === 'ordinario') {
        const opacidadeOrdinario = this.getOpacidadeOrdinario();
        return {
          'border-left': `4px solid ${cor}`,
          'background': `${cor}${opacity}`,
          'opacity': opacidadeOrdinario.toString()
        };
      }
      
      return {
        'border-left': `4px solid ${cor}`,
        'background': `${cor}${opacity}`
      };
    } else if (evento.coresServicos.length > 1) {
      // Múltiplos tipos sem conflito - usar padrão configurado
      if (this.perfilUsuario.configuracoes.usarCoresSobrepostasAlternativas) {
        // Padrão listrado horizontal
        const coresMapeadas = evento.tiposServicos.map(tipo => this.mapearCorPorTipo(tipo, coresAtivas));
        return {
          'background': `repeating-linear-gradient(90deg, ${coresMapeadas.map((cor, i) => 
            `${cor} ${i * 15}px, ${cor} ${(i + 1) * 15}px`).join(', ')})`,
          'opacity': '0.8'
        };
      } else {
        // Gradiente diagonal (padrão)
        const coresMapeadas = evento.tiposServicos.map(tipo => this.mapearCorPorTipo(tipo, coresAtivas));
        return {
          'background': `linear-gradient(45deg, ${coresMapeadas.join(', ')})`,
          'opacity': '0.7'
        };
      }
    }
    
    return {};
  }

  private mapearCorPorTipo(tipo: string, coresAtivas: { [key: string]: string }): string {
    // Mapear tipos para chaves de cores
    const mapeamento: { [key: string]: string } = {
      'ordinario': 'ordinario',
      'ras-voluntario': 'ras-voluntario',
      'ras-compulsorio': 'ras-compulsorio',
      'troca-ordinario': 'troca-ordinario',
      'troca-ras': 'troca-ras',
      'voluntario': 'ras-voluntario',
      'compulsorio': 'ras-compulsorio'
    };
    
    const chave = mapeamento[tipo] || tipo;
    return coresAtivas[chave] || coresAtivas['ordinario'];
  }

  private getEstiloConflito(cores: string[], coresAtivas: { [key: string]: string }): { [key: string]: string } {
    // Para conflitos, usar padrão listrado
    const coresConflito = cores.slice(0, -1); // Remove a cor de conflito
    const corConflito = coresAtivas['conflito'];
    
    if (coresConflito.length === 1) {
      return {
        'background': `repeating-linear-gradient(
          45deg,
          ${coresConflito[0]},
          ${coresConflito[0]} 10px,
          ${corConflito} 10px,
          ${corConflito} 20px
        )`,
        'border': `2px solid ${corConflito}`,
        'animation': 'pulse 2s infinite'
      };
    } else {
      return {
        'background': `repeating-linear-gradient(
          45deg,
          ${coresConflito.join(' 5px, ')} 5px,
          ${corConflito} 10px,
          ${corConflito} 15px
        )`,
        'border': `2px solid ${corConflito}`,
        'animation': 'pulse 2s infinite'
      };
    }
  }

  formatarTipoServico(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'ordinario': 'Ordinário',
      'ras-voluntario': 'RAS Voluntário',
      'ras-compulsorio': 'RAS Compulsório',
      'troca-ordinario': 'Troca Ordinário',
      'troca-ras': 'Troca RAS'
    };
    
    return tipos[tipo] || tipo;
  }

  getLegendaCores(): { cor: string; label: string }[] {
    const coresAtivas = this.getCoresAtivas();
    return [
      { cor: coresAtivas['ordinario'], label: 'Ordinário' },
      { cor: coresAtivas['ras-voluntario'], label: 'RAS Voluntário' },
      { cor: coresAtivas['ras-compulsorio'], label: 'RAS Compulsório' },
      { cor: coresAtivas['troca-ordinario'], label: 'Troca Ordinário' },
      { cor: coresAtivas['troca-ras'], label: 'Troca RAS' },
      { cor: coresAtivas['conflito'], label: 'Conflito de Horários' }
    ];
  }

  getCoresAtivas(): { [key: string]: string } {
    return this.perfilUsuario.configuracoes.usarCoresSobrepostasAlternativas 
      ? this.coresAlternativas 
      : this.coresServicos;
  }

  alternarCoresSobrepostas(): void {
    this.perfilUsuario.configuracoes.usarCoresSobrepostasAlternativas = 
      !this.perfilUsuario.configuracoes.usarCoresSobrepostasAlternativas;
    this.salvarPerfil();
  }

  alternarExibicaoValorOrdinario(): void {
    this.perfilUsuario.configuracoes.exibirValorOrdinario = 
      !this.perfilUsuario.configuracoes.exibirValorOrdinario;
    this.salvarPerfil();
  }

  getTextoOrdinario(): string {
    return this.perfilUsuario.configuracoes.exibirValorOrdinario 
      ? 'Valor incluído no salário' 
      : 'Incluído no salário mensal';
  }

  getOpacidadeOrdinario(): number {
    return this.perfilUsuario.configuracoes.exibirValorOrdinario ? 0.8 : 0.4;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.perfilUsuario.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(): void {
    this.perfilUsuario.avatar = '';
  }

  // Métodos para interagir com alertas
  dismissAlert(alertaId: string): void {
    this.alertasAtivos = this.alertasAtivos.filter(a => a.id !== alertaId);
  }

  // Métodos para metas
  getCorProgressoMeta(meta: MetaComProgresso): string {
    if (meta.progresso.percentual >= 100) return '#22C55E'; // Verde - concluída
    if (meta.progresso.percentual >= 75) return '#3B82F6';  // Azul - boa
    if (meta.progresso.percentual >= 50) return '#F59E0B';  // Amarelo - média
    return '#EF4444'; // Vermelho - baixa
  }
}
