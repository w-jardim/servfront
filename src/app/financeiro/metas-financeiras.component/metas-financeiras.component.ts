import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FinanceiroDataService, MetaFinanceira } from '../financeiro-data.service';

@Component({
  selector: 'app-metas-financeiras',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './metas-financeiras.component.html',
  styleUrls: ['./metas-financeiras.component.scss']
})
export class MetasFinanceirasComponent implements OnInit {
  metas: MetaFinanceira[] = [];
  metaSelecionada: MetaFinanceira | null = null;
  mostrarFormulario = false;
  modoEdicao = false;

  // Formulário
  novaMeta = {
    policial: 'João Silva',
    titulo: '',
    valorMeta: 0,
    prazoMeta: '',
    tiposServicoPreferidos: [] as string[]
  };

  tiposServicoDisponiveis = [
    { id: 'ras-voluntario-batalhao', nome: 'RAS Voluntário Batalhão', valor: 65 },
    { id: 'ras-voluntario-projeto', nome: 'RAS Voluntário Projetos', valor: 85 },
    { id: 'ras-compulsorio-padrao', nome: 'RAS Compulsório Padrão', valor: 45 },
    { id: 'ras-compulsorio-troca', nome: 'RAS Compulsório Troca', valor: 40 },
    { id: 'ordinario-troca', nome: 'Ordinário Troca', valor: 25 }
  ];

  constructor(private financeiroService: FinanceiroDataService) {}

  ngOnInit(): void {
    this.carregarMetas();
  }

  carregarMetas(): void {
    this.financeiroService.metas$.subscribe(metas => {
      this.metas = metas;
    });
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.modoEdicao = false;
    this.resetarFormulario();
  }

  editarMeta(meta: MetaFinanceira): void {
    this.metaSelecionada = meta;
    this.modoEdicao = true;
    this.mostrarFormulario = true;
    
    this.novaMeta = {
      policial: meta.policial,
      titulo: meta.titulo,
      valorMeta: meta.valorMeta,
      prazoMeta: meta.prazoMeta.toISOString().split('T')[0],
      tiposServicoPreferidos: [...meta.tiposServicoPreferidos]
    };
  }

  excluirMeta(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      this.financeiroService.excluirMeta(id);
    }
  }

  salvarMeta(): void {
    if (this.validarFormulario()) {
      const metaDados = {
        ...this.novaMeta,
        prazoMeta: new Date(this.novaMeta.prazoMeta),
        valorAtual: 0,
        servicosRealizados: 0,
        servicosNecessarios: this.calcularServicosNecessarios(),
        status: 'ativa' as const
      };

      if (this.modoEdicao && this.metaSelecionada) {
        this.financeiroService.editarMeta(this.metaSelecionada.id, metaDados);
      } else {
        this.financeiroService.adicionarMeta(metaDados);
      }

      this.fecharFormulario();
    }
  }

  toggleTipoServico(tipoId: string): void {
    const index = this.novaMeta.tiposServicoPreferidos.indexOf(tipoId);
    if (index > -1) {
      this.novaMeta.tiposServicoPreferidos.splice(index, 1);
    } else {
      this.novaMeta.tiposServicoPreferidos.push(tipoId);
    }
  }

  calcularProgresso(meta: MetaFinanceira): { percentual: number, valorRestante: number, servicosRestantes: number } {
    return this.financeiroService.calcularProgressoMeta(meta.id);
  }

  private validarFormulario(): boolean {
    return this.novaMeta.titulo.trim() !== '' && 
           this.novaMeta.valorMeta > 0 && 
           this.novaMeta.prazoMeta !== '';
  }

  calcularServicosNecessarios(): number {
    if (this.novaMeta.tiposServicoPreferidos.length === 0) return 0;
    
    const valoresPreferidos = this.novaMeta.tiposServicoPreferidos.map(tipoId => {
      const tipo = this.tiposServicoDisponiveis.find(t => t.id === tipoId);
      return tipo ? tipo.valor : 65;
    });
    
    const valorMedioHora = valoresPreferidos.reduce((a, b) => a + b, 0) / valoresPreferidos.length;
    return Math.ceil(this.novaMeta.valorMeta / (valorMedioHora * 6)); // Assumindo 6h por serviço
  }

  private resetarFormulario(): void {
    this.novaMeta = {
      policial: 'João Silva',
      titulo: '',
      valorMeta: 0,
      prazoMeta: '',
      tiposServicoPreferidos: []
    };
  }

  private fecharFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicao = false;
    this.metaSelecionada = null;
    this.resetarFormulario();
  }

  fecharFormularioSemSalvar(): void {
    this.fecharFormulario();
  }

  getTipoServicoNome(tipoId: string): string {
    const tipo = this.tiposServicoDisponiveis.find(t => t.id === tipoId);
    return tipo ? tipo.nome : tipoId;
  }
}
