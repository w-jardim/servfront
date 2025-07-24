import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
}

export interface TabelaValores {
  [posto: string]: {
    [turno: string]: {
      servcontrol: number;
      cproeis: number;
    };
  };
}

export interface TabelaValoresFixos {
  [posto: string]: {
    [duracao: number]: number;
  };
}

@Component({
  selector: 'app-cadastro-ras',
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-ras.component.html',
  styleUrl: './cadastro-ras.component.scss'
})
export class CadastroRasComponent implements OnInit {
  @Input() servico: ServicoRAS | null = null;
  @Input() dataInicial: string = '';
  @Input() horaInicial: string = '';
  @Input() tabelaValores: TabelaValores = {};
  @Input() tabelaValoresFixos: TabelaValoresFixos = {};
  @Input() valorAlimentacao: number = 0;
  @Input() valorTransporte: number = 0;
  @Input() limiteHorasRestantes: number = 0;

  @Output() servicoSalvo = new EventEmitter<ServicoRAS>();
  @Output() servicoExcluido = new EventEmitter<string>();
  @Output() modalFechado = new EventEmitter<void>();

  formulario: ServicoRAS = {
    id: '',
    status: 'agendado',
    posto: '',
    turno: '',
    duracao: 8,
    data: '',
    horaInicio: '',
    horaFim: '',
    tipo: 'voluntario',
    modalidade: 'titular',
    projeto: 'ServControl',
    local: '',
    observacoes: '',
    valorHora: 0,
    valorTotal: 0,
    valorAlimentacao: 0,
    valorTransporte: 0,
    valorFinal: 0
  };

  postos = ['Soldado', 'Cabo', 'Sargento', 'Subtenente', 'Tenente', 'Capitão', 'Major', 'Tenente-Coronel', 'Coronel'];
  turnos = ['Diurno', 'Noturno'];
  locais = ['1º BPM', '2º BPM', '3º BPM', '4º BPM', '5º BPM', 'CPE', 'BOPE', 'COE'];

  modoEdicao = false;
  erros: string[] = [];

  ngOnInit() {
    if (this.servico) {
      this.formulario = { ...this.servico };
      this.modoEdicao = true;
    } else {
      this.formulario.data = this.dataInicial;
      this.formulario.horaInicio = this.horaInicial;
      this.calcularHoraFim();
    }
    
    this.formulario.valorAlimentacao = this.valorAlimentacao;
    this.formulario.valorTransporte = this.valorTransporte;
    this.calcularValores();
  }

  calcularHoraFim() {
    if (this.formulario.horaInicio && this.formulario.duracao) {
      const [horas, minutos] = this.formulario.horaInicio.split(':').map(Number);
      const dataInicio = new Date();
      dataInicio.setHours(horas, minutos, 0, 0);
      
      const dataFim = new Date(dataInicio.getTime() + (this.formulario.duracao * 60 * 60 * 1000));
      
      this.formulario.horaFim = `${dataFim.getHours().toString().padStart(2, '0')}:${dataFim.getMinutes().toString().padStart(2, '0')}`;
    }
  }

  calcularValores() {
    if (this.formulario.posto && this.formulario.turno && this.formulario.duracao) {
      // Obter valor por hora para exibição
      const valores = this.tabelaValores[this.formulario.posto]?.[this.formulario.turno];
      if (valores) {
        this.formulario.valorHora = this.formulario.projeto === 'CPROEIS' ? valores.cproeis : valores.servcontrol;
      }
      
      // Usar valor fixo da tabela para cálculo
      const valorBase = this.tabelaValoresFixos[this.formulario.posto]?.[this.formulario.duracao];
      if (valorBase) {
        this.formulario.valorTotal = valorBase;
        this.formulario.valorAlimentacao = this.formulario.projeto === 'CPROEIS' ? this.valorAlimentacao : 0;
        this.formulario.valorTransporte = this.valorTransporte;
        this.formulario.valorFinal = this.formulario.valorTotal + this.formulario.valorAlimentacao + this.formulario.valorTransporte;
      }
    }
  }

  onChangePosto() {
    this.calcularValores();
  }

  onChangeTurno() {
    this.calcularValores();
  }

  onChangeProjeto() {
    this.calcularValores();
  }

  onChangeDuracao() {
    this.calcularHoraFim();
    this.calcularValores();
  }

  onChangeHoraInicio() {
    this.calcularHoraFim();
  }

  onChangeTipo() {
    // Para RAS Compulsório, sempre Titular
    if (this.formulario.tipo === 'compulsorio') {
      this.formulario.modalidade = 'titular';
    }
  }

  validarFormulario(): boolean {
    this.erros = [];

    if (!this.formulario.posto) {
      this.erros.push('Posto é obrigatório');
    }

    if (!this.formulario.turno) {
      this.erros.push('Turno é obrigatório');
    }

    if (!this.formulario.data) {
      this.erros.push('Data é obrigatória');
    }

    if (!this.formulario.horaInicio) {
      this.erros.push('Hora de início é obrigatória');
    }

    if (!this.formulario.local) {
      this.erros.push('Local é obrigatório');
    }

    if (this.formulario.duracao < 4 || this.formulario.duracao > 12) {
      this.erros.push('Duração deve ser entre 4 e 12 horas');
    }

    if (this.formulario.duracao > this.limiteHorasRestantes) {
      this.erros.push(`Duração excede o limite disponível (${this.limiteHorasRestantes}h restantes)`);
    }

    return this.erros.length === 0;
  }

  salvar() {
    if (!this.validarFormulario()) {
      return;
    }

    if (!this.modoEdicao) {
      this.formulario.id = Date.now().toString();
    }

    this.servicoSalvo.emit(this.formulario);
  }

  excluir() {
    if (this.modoEdicao && this.formulario.id) {
      this.servicoExcluido.emit(this.formulario.id);
    }
  }

  fechar() {
    this.modalFechado.emit();
  }
}
