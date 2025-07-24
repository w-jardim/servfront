import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CronogramaUnificadoComponent, ServicoAgendado, ConflictInfo } from '../../shared/cronograma-unificado/cronograma-unificado.component';
import { CadastroOrdinarioComponent } from '../../formulario/cadastro-ordinario.component/cadastro-ordinario.component';

@Component({
  selector: 'app-ordinario',
  standalone: true,
  imports: [CommonModule, CronogramaUnificadoComponent, CadastroOrdinarioComponent],
  templateUrl: './ordinario.component.html',
  styleUrl: './ordinario.component.scss'
})
export class OrdinarioComponent implements OnInit {
  servicos: ServicoAgendado[] = [];
  tiposExibicao: ('ordinario' | 'ras-voluntario' | 'ras-compulsorio')[] = ['ordinario'];
  modoVisualizacao: 'semanal' | 'mensal' = 'semanal';
  dataAtual = new Date();
  
  mostrarModalCadastro = false;
  servicoEdicao: ServicoAgendado | null = null;
  dataSelecionada: Date | null = null;
  horaSelecionada: string | null = null;
  
  conflitosDetectados: ConflictInfo[] = [];
  
  // Estatísticas
  estatisticas = {
    totalServicosMes: 0,
    horasProgramadas: 0,
    servicosHoje: 0,
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
        tipo: 'ordinario',
        data: new Date(),
        horaInicio: '06:00',
        horaFim: '14:00',
        policial: 'Soldado João Silva',
        local: '1ª Cia - Centro',
        observacoes: 'Patrulhamento comercial'
      },
      {
        id: '2',
        tipo: 'ordinario',
        data: new Date(Date.now() + 86400000), // Amanhã
        horaInicio: '14:00',
        horaFim: '22:00',
        policial: 'Cabo Maria Santos',
        local: '2ª Cia - Bairro Norte',
        observacoes: 'Policiamento ostensivo'
      },
      {
        id: '3',
        tipo: 'ordinario',
        data: new Date(Date.now() + 2 * 86400000), // Depois de amanhã
        horaInicio: '22:00',
        horaFim: '06:00',
        policial: 'Soldado Pedro Costa',
        local: '3ª Cia - Zona Sul',
        observacoes: 'Patrulhamento noturno'
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
    
    const servicosHoje = this.servicos.filter(s => {
      const dataServico = new Date(s.data);
      return dataServico.toDateString() === hoje.toDateString();
    });
    
    let horasProgramadas = 0;
    servicosMes.forEach(servico => {
      const inicio = this.converterHoraParaMinutos(servico.horaInicio);
      const fim = this.converterHoraParaMinutos(servico.horaFim);
      let duracao = fim - inicio;
      if (duracao < 0) duracao += 24 * 60; // Serviço que cruza meia-noite
      horasProgramadas += duracao / 60;
    });
    
    this.estatisticas = {
      totalServicosMes: servicosMes.length,
      horasProgramadas: Math.round(horasProgramadas),
      servicosHoje: servicosHoje.length,
      conflitosAtivos: this.conflitosDetectados.length
    };
  }

  private converterHoraParaMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  onServicoClicado(servico: ServicoAgendado) {
    this.servicoEdicao = servico;
    this.mostrarModalCadastro = true;
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

  onServicoSalvo(servico: ServicoAgendado) {
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
    // Implementar exportação em PDF/Excel
    console.log('Exportar cronograma');
  }

  imprimirCronograma() {
    window.print();
  }
}
