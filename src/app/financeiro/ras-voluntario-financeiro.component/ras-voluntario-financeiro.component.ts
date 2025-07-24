import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FinanceiroDataService, DadosFinanceiros } from '../financeiro-data.service';

@Component({
  selector: 'app-ras-voluntario-financeiro',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ras-voluntario-financeiro.component.html',
  styleUrls: ['./ras-voluntario-financeiro.component.scss']
})
export class RasVoluntarioFinanceiroComponent implements OnInit {
  dadosRas: DadosFinanceiros[] = [];

  valores = {
    batalhao: 65,
    projetos: 85
  };

  constructor(private financeiroService: FinanceiroDataService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.financeiroService.dadosFinanceiros$.subscribe(dados => {
      this.dadosRas = dados.filter(d => d.tipoServico === 'ras-voluntario');
    });
  }

  get totalBatalhao(): number {
    return this.dadosRas
      .filter(d => d.subtipo === 'batalhao')
      .reduce((total, d) => total + d.valorTotal, 0);
  }

  get totalProjetos(): number {
    return this.dadosRas
      .filter(d => d.subtipo === 'projeto-especial')
      .reduce((total, d) => total + d.valorTotal, 0);
  }

  get totalGeral(): number {
    return this.totalBatalhao + this.totalProjetos;
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
    console.log('Exportando relatório RAS Voluntário');
    // Implementar exportação
  }
}
