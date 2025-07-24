import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ServicoAgendado {
  id: string;
  tipo: 'ordinario' | 'ras-voluntario' | 'ras-compulsorio' | 'troca-ordinario' | 'troca-ras';
  data: Date;
  horaInicio: string;
  horaFim: string;
  policial: string;
  local?: string;
  observacoes?: string;
  status?: string;
}

export interface ConflictInfo {
  tipo: 'sobreposicao' | 'descanso-insuficiente';
  servico1: ServicoAgendado;
  servico2: ServicoAgendado;
  mensagem: string;
}

@Component({
  selector: 'app-cronograma-unificado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cronograma-unificado.component.html',
  styleUrls: ['./cronograma-unificado.component.scss']
})
export class CronogramaUnificadoComponent implements OnInit, OnChanges {
  @Input() servicos: ServicoAgendado[] = [];
  @Input() exibirTipos: ('ordinario' | 'ras-voluntario' | 'ras-compulsorio' | 'troca-ordinario' | 'troca-ras')[] = ['ordinario', 'ras-voluntario', 'ras-compulsorio'];
  @Input() modoVisualizacao: 'semanal' | 'mensal' = 'semanal';
  @Input() dataInicial: Date = new Date();
  
  @Output() servicoClicado = new EventEmitter<ServicoAgendado>();
  @Output() novoServico = new EventEmitter<{data: Date, hora: string}>();
  @Output() conflitosDetectados = new EventEmitter<ConflictInfo[]>();

  diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  horasExibicao: string[] = [];
  diasExibicao: Date[] = [];
  conflitos: ConflictInfo[] = [];

  ngOnInit() {
    this.gerarHorasExibicao();
    this.gerarDiasExibicao();
    this.validarConflitos();
  }

  ngOnChanges() {
    this.gerarDiasExibicao();
    this.validarConflitos();
  }

  private gerarHorasExibicao() {
    this.horasExibicao = [];
    for (let hora = 0; hora < 24; hora++) {
      this.horasExibicao.push(String(hora).padStart(2, '0') + ':00');
    }
  }

  private gerarDiasExibicao() {
    this.diasExibicao = [];
    const dataRef = new Date(this.dataInicial);
    
    if (this.modoVisualizacao === 'semanal') {
      // Encontrar o domingo da semana
      const diaSemana = dataRef.getDay();
      dataRef.setDate(dataRef.getDate() - diaSemana);
      
      for (let i = 0; i < 7; i++) {
        this.diasExibicao.push(new Date(dataRef));
        dataRef.setDate(dataRef.getDate() + 1);
      }
    } else {
      // Modo mensal - primeiro dia do mês
      dataRef.setDate(1);
      const ultimoDia = new Date(dataRef.getFullYear(), dataRef.getMonth() + 1, 0).getDate();
      
      for (let dia = 1; dia <= ultimoDia; dia++) {
        this.diasExibicao.push(new Date(dataRef.getFullYear(), dataRef.getMonth(), dia));
      }
    }
  }

  private validarConflitos() {
    this.conflitos = [];
    const servicosFiltrados = this.servicos.filter(s => this.exibirTipos.includes(s.tipo));

    for (let i = 0; i < servicosFiltrados.length; i++) {
      for (let j = i + 1; j < servicosFiltrados.length; j++) {
        const servico1 = servicosFiltrados[i];
        const servico2 = servicosFiltrados[j];

        // Verificar se são do mesmo policial
        if (servico1.policial === servico2.policial) {
          const conflito = this.verificarConflito(servico1, servico2);
          if (conflito) {
            this.conflitos.push(conflito);
          }
        }
      }
    }

    this.conflitosDetectados.emit(this.conflitos);
  }

  private verificarConflito(servico1: ServicoAgendado, servico2: ServicoAgendado): ConflictInfo | null {
    const data1 = new Date(servico1.data);
    const data2 = new Date(servico2.data);
    
    // Se são dias diferentes, verificar descanso de 8h
    if (data1.toDateString() !== data2.toDateString()) {
      return this.verificarDescanso8h(servico1, servico2);
    }

    // Mesmo dia - verificar sobreposição
    return this.verificarSobreposicao(servico1, servico2);
  }

  private verificarSobreposicao(servico1: ServicoAgendado, servico2: ServicoAgendado): ConflictInfo | null {
    // Sobreposição só é permitida entre Ordinário e RAS Voluntário
    const tiposPermitidos = ['ordinario', 'ras-voluntario'];
    const ambosPermitidos = tiposPermitidos.includes(servico1.tipo) && tiposPermitidos.includes(servico2.tipo);

    if (!ambosPermitidos) {
      // RAS Compulsório não pode sobrepor com nada
      if (servico1.tipo === 'ras-compulsorio' || servico2.tipo === 'ras-compulsorio') {
        return {
          tipo: 'sobreposicao',
          servico1,
          servico2,
          mensagem: 'RAS Compulsório não pode sobrepor com outros serviços no mesmo dia'
        };
      }
    }

    // Verificar sobreposição de horários
    const inicio1 = this.converterHoraParaMinutos(servico1.horaInicio);
    const fim1 = this.converterHoraParaMinutos(servico1.horaFim);
    const inicio2 = this.converterHoraParaMinutos(servico2.horaInicio);
    const fim2 = this.converterHoraParaMinutos(servico2.horaFim);

    if ((inicio1 < fim2 && fim1 > inicio2) && !ambosPermitidos) {
      return {
        tipo: 'sobreposicao',
        servico1,
        servico2,
        mensagem: 'Horários sobrepostos - apenas Ordinário e RAS Voluntário podem sobrepor'
      };
    }

    return null;
  }

  private verificarDescanso8h(servico1: ServicoAgendado, servico2: ServicoAgendado): ConflictInfo | null {
    const dataHora1Fim = this.combinarDataHora(servico1.data, servico1.horaFim);
    const dataHora1Inicio = this.combinarDataHora(servico1.data, servico1.horaInicio);
    const dataHora2Fim = this.combinarDataHora(servico2.data, servico2.horaFim);
    const dataHora2Inicio = this.combinarDataHora(servico2.data, servico2.horaInicio);

    // Determinar qual serviço vem primeiro
    let servicoAnterior, servicoPosterior;
    if (dataHora1Fim < dataHora2Inicio) {
      servicoAnterior = servico1;
      servicoPosterior = servico2;
    } else if (dataHora2Fim < dataHora1Inicio) {
      servicoAnterior = servico2;
      servicoPosterior = servico1;
    } else {
      return null; // Não há sequência clara
    }

    const fimAnterior = this.combinarDataHora(servicoAnterior.data, servicoAnterior.horaFim);
    const inicioPosterior = this.combinarDataHora(servicoPosterior.data, servicoPosterior.horaInicio);
    
    const diferencaHoras = (inicioPosterior.getTime() - fimAnterior.getTime()) / (1000 * 60 * 60);

    if (diferencaHoras < 8) {
      return {
        tipo: 'descanso-insuficiente',
        servico1: servicoAnterior,
        servico2: servicoPosterior,
        mensagem: `Descanso insuficiente: ${diferencaHoras.toFixed(1)}h (mínimo 8h)`
      };
    }

    return null;
  }

  private combinarDataHora(data: Date, hora: string): Date {
    const [horas, minutos] = hora.split(':').map(Number);
    const resultado = new Date(data);
    resultado.setHours(horas, minutos, 0, 0);
    return resultado;
  }

  private converterHoraParaMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  getServicosPorDiaHora(data: Date, hora: string): ServicoAgendado[] {
    return this.servicos.filter(servico => {
      if (!this.exibirTipos.includes(servico.tipo)) return false;
      
      const servicoData = new Date(servico.data);
      if (servicoData.toDateString() !== data.toDateString()) return false;

      const horaInicio = this.converterHoraParaMinutos(servico.horaInicio);
      const horaFim = this.converterHoraParaMinutos(servico.horaFim);
      const horaAtual = this.converterHoraParaMinutos(hora);

      return horaAtual >= horaInicio && horaAtual < horaFim;
    });
  }

  getClasseServico(servico: ServicoAgendado): string {
    const classes = [`servico-${servico.tipo}`];
    
    // Verificar se há conflito para este serviço
    const temConflito = this.conflitos.some(c => 
      c.servico1.id === servico.id || c.servico2.id === servico.id
    );
    
    if (temConflito) {
      classes.push('servico-conflito');
    }

    return classes.join(' ');
  }

  onServicoClick(servico: ServicoAgendado) {
    this.servicoClicado.emit(servico);
  }

  onCelulaClick(data: Date, hora: string) {
    // Verificar se já há serviços neste horário
    const servicosExistentes = this.getServicosPorDiaHora(data, hora);
    if (servicosExistentes.length === 0) {
      this.novoServico.emit({ data, hora });
    }
  }

  navegarSemana(direcao: 'anterior' | 'proxima') {
    const novaData = new Date(this.dataInicial);
    const dias = this.modoVisualizacao === 'semanal' ? 7 : 30;
    
    if (direcao === 'anterior') {
      novaData.setDate(novaData.getDate() - dias);
    } else {
      novaData.setDate(novaData.getDate() + dias);
    }
    
    this.dataInicial = novaData;
    this.gerarDiasExibicao();
  }

  formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }

  getTipoLabel(tipo: string): string {
    const labels = {
      'ordinario': 'ORD',
      'ras-voluntario': 'RAS-V',
      'ras-compulsorio': 'RAS-C'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  }
}
