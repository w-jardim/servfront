import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceiroDataService, MetaFinanceira, DadosFinanceiros } from '../financeiro-data.service';

@Component({
  selector: 'app-visao-geral-financeira',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visao-geral-financeira.component.html',
  styleUrl: './visao-geral-financeira.component.scss'
})
export class VisaoGeralFinanceiraComponent implements OnInit {
  dadosFinanceiros: DadosFinanceiros[] = [];
  metas: MetaFinanceira[] = [];

  constructor(private financeiroService: FinanceiroDataService) {}

  get metasAtivas(): MetaFinanceira[] {
    return this.metas.filter(meta => meta.status === 'ativa');
  }

  ngOnInit(): void {
    this.financeiroService.metas$.subscribe(metas => {
      this.metas = metas;
    });

    this.financeiroService.dadosFinanceiros$.subscribe(dados => {
      this.dadosFinanceiros = dados;
    });
  }

  get totalMensal(): number {
    return this.dadosFinanceiros.reduce((total, dados) => total + dados.valorTotal, 0);
  }

  get totalPago(): number {
    return this.dadosFinanceiros
      .filter(dados => dados.statusPagamento === 'pago')
      .reduce((total, dados) => total + dados.valorTotal, 0);
  }

  get totalPendente(): number {
    return this.dadosFinanceiros
      .filter(dados => dados.statusPagamento === 'pendente')
      .reduce((total, dados) => total + dados.valorTotal, 0);
  }

  getDistribuicaoTipos(): any[] {
    const tipos = this.dadosFinanceiros.reduce((acc, dados) => {
      if (!acc[dados.tipoServico]) {
        acc[dados.tipoServico] = 0;
      }
      acc[dados.tipoServico] += dados.valorTotal;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(tipos).map(([tipo, valor]) => ({
      tipo: this.formatarTipoServico(tipo),
      valor,
      percentual: (valor / this.totalMensal) * 100
    }));
  }

  getDistribuicaoPorTipo(): any[] {
    return this.getDistribuicaoTipos();
  }

  formatarTipoServico(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'ras-voluntario-batalhao': 'RAS Voluntário Batalhão',
      'ras-voluntario-projeto': 'RAS Voluntário Projetos',
      'ras-compulsorio-padrao': 'RAS Compulsório Padrão',
      'ras-compulsorio-troca': 'RAS Compulsório Troca',
      'ordinario-troca': 'Ordinário Troca'
    };
    return tipos[tipo] || tipo;
  }

  editarServico(servico: DadosFinanceiros): void {
    console.log('Editar serviço:', servico);
    // Implementar edição
  }

  excluirServico(servico: DadosFinanceiros): void {
    if (confirm('Deseja realmente excluir este serviço?')) {
      this.financeiroService.excluirDadoFinanceiro(servico.servicoId);
    }
  }
}
