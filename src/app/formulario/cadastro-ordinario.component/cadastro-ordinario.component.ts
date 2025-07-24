import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoAgendado } from '../../shared/cronograma-unificado/cronograma-unificado.component';
import { ServicosDataService, Policial } from '../../shared/services/servicos-data.service';

@Component({
  selector: 'app-cadastro-ordinario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-ordinario.component.html',
  styleUrl: './cadastro-ordinario.component.scss'
})
export class CadastroOrdinarioComponent implements OnInit {
  @Input() servico: ServicoAgendado | null = null;
  @Input() dataInicial: Date | null = null;
  @Input() horaInicial: string | null = null;
  
  @Output() servicoSalvo = new EventEmitter<ServicoAgendado>();
  @Output() servicoExcluido = new EventEmitter<string>();
  @Output() modalFechado = new EventEmitter<void>();

  formulario: Partial<ServicoAgendado> = {};
  
  // Dados para campos editáveis
  policiais: Policial[] = [];
  locais: string[] = [];
  policialNome = '';
  erros: string[] = [];

  constructor(private servicosDataService: ServicosDataService) {
    this.policiais = this.servicosDataService.getPoliciais();
    this.locais = this.servicosDataService.locais;
  }

  ngOnInit() {
    if (this.servico) {
      this.formulario = { ...this.servico };
      this.initializePolicialName();
    } else {
      this.formulario = {
        tipo: 'ordinario',
        data: this.dataInicial || new Date(),
        horaInicio: this.horaInicial || '06:00',
        horaFim: '14:00',
        policial: '',
        local: '',
        observacoes: ''
      };
    }
  }

  initializePolicialName() {
    if (this.formulario.policial) {
      const policial = this.policiais.find(p => p.id === this.formulario.policial);
      if (policial) {
        this.policialNome = `${policial.posto} ${policial.nome} - ${policial.unidade}`;
      }
    }
  }

  onPolicialChange(event: any) {
    const nomeCompleto = event.target.value;
    this.policialNome = nomeCompleto;
    
    // Encontrar o policial correspondente
    const policial = this.policiais.find(p => 
      `${p.posto} ${p.nome} - ${p.unidade}` === nomeCompleto
    );
    
    if (policial) {
      this.formulario.policial = policial.id;
    } else {
      this.formulario.policial = '';
    }
  }

  validarFormulario(): boolean {
    this.erros = [];
    
    if (!this.formulario.policial) {
      this.erros.push('Policial é obrigatório');
    }
    
    if (!this.formulario.data) {
      this.erros.push('Data é obrigatória');
    }
    
    if (!this.formulario.horaInicio) {
      this.erros.push('Hora de início é obrigatória');
    }
    
    if (!this.formulario.horaFim) {
      this.erros.push('Hora de fim é obrigatória');
    }
    
    if (!this.formulario.local) {
      this.erros.push('Local é obrigatório');
    }
    
    return this.erros.length === 0;
  }

  salvar() {
    if (this.validarFormulario()) {
      if (!this.servico) {
        this.formulario.id = Date.now().toString();
      }
      this.servicoSalvo.emit(this.formulario as ServicoAgendado);
    }
  }

  excluir() {
    if (this.servico?.id) {
      this.servicoExcluido.emit(this.servico.id);
    }
  }

  fechar() {
    this.modalFechado.emit();
  }
}
