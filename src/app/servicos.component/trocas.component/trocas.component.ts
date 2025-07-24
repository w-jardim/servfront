import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CronogramaUnificadoComponent, ServicoAgendado } from '../../shared/cronograma-unificado/cronograma-unificado.component';
import { ServicosDataService, TrocaServico, Policial, ConflictInfo } from '../../shared/services/servicos-data.service';
import { CadastroTrocaComponent } from '../../formulario/cadastro-troca.component/cadastro-troca.component';

@Component({
  selector: 'app-trocas',
  standalone: true,
  imports: [CommonModule, CronogramaUnificadoComponent, CadastroTrocaComponent],
  templateUrl: './trocas.component.html',
  styleUrl: './trocas.component.scss'
})
export class TrocasComponent implements OnInit, OnDestroy {
  trocas: TrocaServico[] = [];
  policiais: Policial[] = [];
  tiposExibicao: ('ordinario' | 'ras-voluntario' | 'ras-compulsorio' | 'troca-ordinario' | 'troca-ras')[] = 
    ['troca-ordinario', 'troca-ras'];
  modoVisualizacao: 'semanal' | 'mensal' = 'semanal';
  dataAtual = new Date();
  
  // Propriedades para o modal
  mostrarModalCadastro = false;
  trocaEdicao: TrocaServico | null = null;
  dataSelecionada: Date | null = null;
  horaSelecionada: string | null = null;
  
  // Conflitos detectados
  conflitosDetectados: ConflictInfo[] = [];
  
  // Estatísticas
  estatisticas = {
    trocasConfirmadas: 0,
    valorMedioAcordado: 0,
    conflitosAtivos: 0,
    trocasMes: 0
  };

  private subscriptions: Subscription[] = [];

  constructor(private servicosDataService: ServicosDataService) {}

  ngOnInit() {
    this.subscribeToData();
    this.calcularEstatisticas();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToData(): void {
    // Subscribe to trocas
    this.subscriptions.push(
      this.servicosDataService.trocas$.subscribe(trocas => {
        this.trocas = trocas;
        this.calcularEstatisticas();
      })
    );

    // Subscribe to policiais
    this.subscriptions.push(
      this.servicosDataService.policiais$.subscribe(policiais => {
        this.policiais = policiais;
      })
    );

    // Subscribe to conflitos
    this.subscriptions.push(
      this.servicosDataService.conflitos$.subscribe(conflitos => {
        this.conflitosDetectados = conflitos;
        this.estatisticas.conflitosAtivos = conflitos.length;
      })
    );
  }

  private calcularEstatisticas() {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const trocasMes = this.trocas.filter(troca => {
      const dataTroca = new Date(troca.data);
      return dataTroca >= inicioMes && dataTroca <= fimMes;
    });

    let confirmadas = 0;
    let somaValores = 0;

    trocasMes.forEach(troca => {
      // Todas as trocas são confirmadas quando cadastradas
      confirmadas++;
      somaValores += troca.valorAcordado;
    });

    this.estatisticas = {
      trocasConfirmadas: confirmadas,
      trocasMes: trocasMes.length,
      valorMedioAcordado: trocasMes.length > 0 ? somaValores / trocasMes.length : 0,
      conflitosAtivos: this.conflitosDetectados.length
    };
  }

  onServicoClicado(servico: ServicoAgendado) {
    // Verificar se é uma troca clicada
    if (servico.tipo?.includes('troca')) {
      this.trocaEdicao = this.trocas.find(t => t.id === servico.id) || null;
      this.mostrarModalCadastro = true;
    }
  }

  onNovoServico(evento: {data: Date, hora: string}) {
    this.dataSelecionada = evento.data;
    this.horaSelecionada = evento.hora;
    this.trocaEdicao = null;
    this.mostrarModalCadastro = true;
  }

  onConflitosDetectados(conflitos: any[]) {
    // Converter conflitos do cronograma para o formato do serviço de dados
    this.conflitosDetectados = conflitos.map(c => ({
      policial: c.policial || '',
      data: c.data || '',
      horaInicio: c.horaInicio || '',
      horaFim: c.horaFim || '',
      servicos: c.servicos || []
    }));
    this.estatisticas.conflitosAtivos = this.conflitosDetectados.length;
  }

  onTrocaSalva(troca: TrocaServico) {
    if (this.trocaEdicao) {
      // Edição
      this.servicosDataService.updateTroca(troca);
    } else {
      // Nova troca
      troca.id = Date.now().toString();
      this.servicosDataService.addTroca(troca);
    }
    
    this.fecharModal();
  }

  onTrocaExcluida(id: string) {
    this.servicosDataService.deleteTroca(id);
    this.fecharModal();
  }

  fecharModal() {
    this.mostrarModalCadastro = false;
    this.trocaEdicao = null;
    this.dataSelecionada = null;
    this.horaSelecionada = null;
  }

  alternarTipoExibicao(tipo: 'ordinario' | 'ras-voluntario' | 'ras-compulsorio' | 'troca-ordinario' | 'troca-ras') {
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
    console.log('Exportar cronograma de trocas');
  }

  imprimirCronograma() {
    window.print();
  }

  getDataSelecionadaString(): string {
    return this.dataSelecionada ? this.dataSelecionada.toISOString().split('T')[0] : '';
  }

  getHoraSelecionadaString(): string {
    return this.horaSelecionada || '';
  }

  // Converte trocas para ServicoAgendado para compatibilidade com cronograma
  getServicosParaCronograma(): ServicoAgendado[] {
    const todosServicos = this.servicosDataService.obterTodosServicos();
    
    return todosServicos
      .filter(servico => this.tiposExibicao.includes(servico.tipoServico))
      .map(servico => ({
        id: servico.id,
        tipo: servico.tipoServico,
        status: servico.status,
        data: new Date(servico.data),
        horaInicio: servico.horaInicio,
        horaFim: servico.horaFim,
        policial: servico.policial,
        local: servico.local,
        observacoes: servico.observacoes || ''
      }));
  }
}
