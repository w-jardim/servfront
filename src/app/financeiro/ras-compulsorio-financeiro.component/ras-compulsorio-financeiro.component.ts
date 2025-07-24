import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FinanceiroDataService, DadosFinanceiros } from '../financeiro-data.service';

@Component({
  selector: 'app-ras-compulsorio-financeiro',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ras-compulsorio-financeiro.component.html',
  styleUrls: ['./ras-compulsorio-financeiro.component.scss']
})
export class RasCompulsorioFinanceiroComponent implements OnInit {
  dadosRas: DadosFinanceiros[] = [];

  valores = {
    padrao: 50.00,
    troca: 75.00
  };

  constructor(private financeiroService: FinanceiroDataService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.financeiroService.dadosFinanceiros$.subscribe(dados => {
      this.dadosRas = dados.filter(d => d.tipoServico === 'ras-compulsorio');
    });
  }

  get totalPadrao(): number {
    return this.dadosRas
      .filter(d => !d.subtipo || d.subtipo !== 'compulsorio-troca')
      .reduce((total, d) => total + d.valorTotal, 0);
  }

  get totalTroca(): number {
    return this.dadosRas
      .filter(d => d.subtipo === 'compulsorio-troca')
      .reduce((total, d) => total + d.valorTotal, 0);
  }

  get totalGeral(): number {
    return this.totalPadrao + this.totalTroca;
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
    console.log('Exportando relatório RAS Compulsório');
    // Implementar exportação
  }
}
