import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FinanceiroDataService, DadosFinanceiros } from '../financeiro-data.service';

@Component({
  selector: 'app-ordinario-financeiro',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ordinario-financeiro.component.html',
  styleUrls: ['./ordinario-financeiro.component.scss']
})
export class OrdinarioFinanceiroComponent implements OnInit {
  dadosOrdinario: DadosFinanceiros[] = [];

  valores = {
    batalhao: 35.00,
    especial: 42.00
  };

  constructor(private financeiroService: FinanceiroDataService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.financeiroService.dadosFinanceiros$.subscribe(dados => {
      this.dadosOrdinario = dados.filter(d => d.tipoServico === 'ordinario');
    });
  }

  get totalBatalhao(): number {
    return this.dadosOrdinario
      .filter(d => d.subtipo === 'batalhao')
      .reduce((total, d) => total + d.valorTotal, 0);
  }

  get totalEspecial(): number {
    return this.dadosOrdinario
      .filter(d => d.subtipo === 'projeto-especial')
      .reduce((total, d) => total + d.valorTotal, 0);
  }

  get totalGeral(): number {
    return this.totalBatalhao + this.totalEspecial;
  }

  editarServico(servico: DadosFinanceiros): void {
    console.log('Editando serviço:', servico);
    // Implementar navegação para edição
  }

  excluirServico(servico: DadosFinanceiros): void {
    if (confirm(`Tem certeza que deseja excluir o serviço de ${new Date(servico.dataServico).toLocaleDateString()}?`)) {
      this.financeiroService.excluirDadoFinanceiro(servico.servicoId);
    }
  }

  exportarRelatorio(): void {
    console.log('Exportando relatório Ordinário');
    // Implementar exportação
  }
}
