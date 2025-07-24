import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrocaServico, Policial, ServicosDataService } from '../../shared/services/servicos-data.service';

@Component({
  selector: 'app-cadastro-troca',
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-troca.component.html',
  styleUrl: './cadastro-troca.component.scss'
})
export class CadastroTrocaComponent implements OnInit {
  @Input() troca: TrocaServico | null = null;
  @Input() dataInicial: string = '';
  @Input() horaInicial: string = '';
  @Input() policiais: Policial[] = [];

  @Output() trocaSalva = new EventEmitter<TrocaServico>();
  @Output() trocaExcluida = new EventEmitter<string>();
  @Output() modalFechado = new EventEmitter<void>();

  formulario: TrocaServico = {
    id: '',
    tipo: 'ordinario',
    policialOriginal: '',
    policialSubstituto: '',
    data: '',
    horaInicio: '',
    horaFim: '',
    local: '',
    posto: '',
    duracao: 8,
    valorBase: 0,
    valorTransporte: 0,
    valorAcordado: 0,
    valorFinal: 0,
    status: 'confirmada', // Sempre confirmada ao cadastrar
    observacoes: '',
    servicoOriginalId: ''
  };

  locais: string[] = [];
  postos = ['Soldado', 'Cabo', 'Sargento', 'Subtenente', 'Tenente', 'Capitão', 'Major', 'Tenente-Coronel', 'Coronel'];
  duracoes = [6, 8, 12];

  // Propriedades auxiliares para inputs editáveis
  policialCedeNome = '';
  localPersonalizado = '';

  modoEdicao = false;
  erros: string[] = [];

  constructor(private servicosDataService: ServicosDataService) {
    this.locais = this.servicosDataService.locais;
  }

  ngOnInit() {
    if (this.troca) {
      this.formulario = { ...this.troca };
      this.modoEdicao = true;
      // Inicializar nomes dos policiais se em modo edição
      this.initializePolicialNames();
    } else {
      // Nova troca - já confirmada ao cadastrar
      this.formulario.data = this.dataInicial;
      this.formulario.horaInicio = this.horaInicial;
      this.formulario.status = 'confirmada'; // Troca já aceita
      this.calcularHoraFim();
    }
    
    this.formulario.valorTransporte = this.servicosDataService.valorTransporte;
    this.calcularValores();
  }

  calcularHoraFim() {
    if (this.formulario.horaInicio && this.formulario.duracao) {
      const [horas, minutos] = this.formulario.horaInicio.split(':').map(Number);
      const dataInicio = new Date();
      dataInicio.setHours(horas, minutos, 0, 0);
      
      const dataFim = new Date(dataInicio.getTime() + (this.formulario.duracao! * 60 * 60 * 1000));
      
      this.formulario.horaFim = `${dataFim.getHours().toString().padStart(2, '0')}:${dataFim.getMinutes().toString().padStart(2, '0')}`;
    }
  }

  calcularValores() {
    if (this.formulario.tipo === 'ordinario') {
      // Para ordinário, apenas o valor acordado
      this.formulario.valorBase = 0;
      this.formulario.valorTransporte = 0;
      this.formulario.valorFinal = this.formulario.valorAcordado;
    } else if (this.formulario.tipo === 'ras-compulsorio') {
      // Para RAS compulsório: valor da tabela + transporte + valor acordado
      if (this.formulario.posto && this.formulario.duracao) {
        this.formulario.valorBase = this.servicosDataService.tabelaValoresFixos[this.formulario.posto]?.[this.formulario.duracao] || 0;
        this.formulario.valorTransporte = this.servicosDataService.valorTransporte;
        this.formulario.valorFinal = this.formulario.valorBase + this.formulario.valorTransporte + this.formulario.valorAcordado;
      }
    }
  }

  onChangeTipo() {
    this.calcularValores();
    
    // Limpar campos específicos quando muda o tipo
    if (this.formulario.tipo === 'ordinario') {
      this.formulario.posto = '';
      this.formulario.duracao = 8;
    }
  }

  onChangePosto() {
    this.calcularValores();
  }

  onChangeDuracao() {
    this.calcularHoraFim();
    this.calcularValores();
  }

  onChangeHoraInicio() {
    this.calcularHoraFim();
  }

  onChangeValorAcordado() {
    this.calcularValores();
  }

  validarFormulario(): boolean {
    this.erros = [];

    if (!this.formulario.tipo) {
      this.erros.push('Tipo de troca é obrigatório');
    }

    // Policial que cede é opcional (pode ser inserido manualmente ou não)
    
    if (!this.formulario.data) {
      this.erros.push('Data é obrigatória');
    }

    if (!this.formulario.horaInicio) {
      this.erros.push('Hora de início é obrigatória');
    }

    if (!this.formulario.local) {
      this.erros.push('Local é obrigatório');
    }

    if (this.formulario.tipo === 'ras-compulsorio') {
      if (!this.formulario.posto) {
        this.erros.push('Posto é obrigatório para RAS');
      }

      if (!this.formulario.duracao || this.formulario.duracao < 6 || this.formulario.duracao > 12) {
        this.erros.push('Duração deve ser entre 6 e 12 horas para RAS');
      }
    }

    if (this.formulario.valorAcordado < 0) {
      this.erros.push('Valor acordado não pode ser negativo');
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

    this.trocaSalva.emit(this.formulario);
  }

  excluir() {
    if (this.modoEdicao && this.formulario.id) {
      this.trocaExcluida.emit(this.formulario.id);
    }
  }

  fechar() {
    this.modalFechado.emit();
  }

  getPolicialNome(id: string): string {
    const policial = this.policiais.find(p => p.id === id);
    return policial ? `${policial.posto} ${policial.nome}` : '';
  }

  // Métodos para campos editáveis
  initializePolicialNames() {
    if (this.formulario.policialOriginal) {
      const policial = this.policiais.find(p => p.id === this.formulario.policialOriginal);
      if (policial) {
        this.policialCedeNome = `${policial.posto} ${policial.nome} - ${policial.unidade}`;
      }
    }
  }

  onPolicialCedeChange(event: any) {
    const nomeCompleto = event.target.value;
    this.policialCedeNome = nomeCompleto;
    
    // Encontrar o policial correspondente
    const policial = this.policiais.find(p => 
      `${p.posto} ${p.nome} - ${p.unidade}` === nomeCompleto
    );
    
    if (policial) {
      this.formulario.policialOriginal = policial.id;
    } else {
      this.formulario.policialOriginal = '';
    }
  }

  onLocalPersonalizadoChange(event: any) {
    this.localPersonalizado = event.target.value;
    this.formulario.local = this.localPersonalizado;
  }
}
