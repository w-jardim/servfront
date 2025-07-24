import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MetaFinanceira {
  id: string;
  policial: string;
  titulo: string;
  valorMeta: number;
  prazoMeta: Date;
  valorAtual: number;
  servicosRealizados: number;
  servicosNecessarios: number;
  status: 'ativa' | 'concluida' | 'atrasada';
  tiposServicoPreferidos: string[];
  criadaEm: Date;
  atualizadaEm: Date;
}

export interface DadosFinanceiros {
  servicoId: string;
  policial: string;
  tipoServico: 'ordinario' | 'ras-voluntario' | 'ras-compulsorio' | 'troca';
  subtipo?: 'batalhao' | 'projeto-especial' | 'compulsorio-troca';
  horas: number;
  valorHora: number;
  valorTotal: number;
  dataServico: Date;
  statusPagamento: 'pendente' | 'pago' | 'processando';
  observacoes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceiroDataService {
  private metasSubject = new BehaviorSubject<MetaFinanceira[]>(this.getMetasIniciais());
  private dadosFinanceirosSubject = new BehaviorSubject<DadosFinanceiros[]>(this.getDadosFinanceirosIniciais());

  public metas$ = this.metasSubject.asObservable();
  public dadosFinanceiros$ = this.dadosFinanceirosSubject.asObservable();

  constructor() {}

  // Valores por tipo de serviço
  getValoresPorTipo() {
    return {
      'ordinario': { salario: 8500, troca: 25 },
      'ras-voluntario': { batalhao: 65, 'projeto-especial': 85 },
      'ras-compulsorio': { padrao: 45, troca: 40 }
    };
  }

  // CRUD Metas
  getMetas(): MetaFinanceira[] {
    return this.metasSubject.value;
  }

  adicionarMeta(meta: Omit<MetaFinanceira, 'id' | 'criadaEm' | 'atualizadaEm'>): void {
    const novaMeta: MetaFinanceira = {
      ...meta,
      id: this.generateId(),
      criadaEm: new Date(),
      atualizadaEm: new Date()
    };
    
    const metasAtuais = this.metasSubject.value;
    this.metasSubject.next([...metasAtuais, novaMeta]);
  }

  editarMeta(id: string, metaAtualizada: Partial<MetaFinanceira>): void {
    const metasAtuais = this.metasSubject.value;
    const index = metasAtuais.findIndex(m => m.id === id);
    
    if (index !== -1) {
      metasAtuais[index] = {
        ...metasAtuais[index],
        ...metaAtualizada,
        atualizadaEm: new Date()
      };
      this.metasSubject.next([...metasAtuais]);
    }
  }

  excluirMeta(id: string): void {
    const metasAtuais = this.metasSubject.value;
    const metasFiltradas = metasAtuais.filter(m => m.id !== id);
    this.metasSubject.next(metasFiltradas);
  }

  // CRUD Dados Financeiros
  getDadosFinanceiros(): DadosFinanceiros[] {
    return this.dadosFinanceirosSubject.value;
  }

  adicionarDadoFinanceiro(dado: Omit<DadosFinanceiros, 'servicoId'>): void {
    const novoDado: DadosFinanceiros = {
      ...dado,
      servicoId: this.generateId()
    };
    
    const dadosAtuais = this.dadosFinanceirosSubject.value;
    this.dadosFinanceirosSubject.next([...dadosAtuais, novoDado]);
  }

  editarDadoFinanceiro(servicoId: string, dadoAtualizado: Partial<DadosFinanceiros>): void {
    const dadosAtuais = this.dadosFinanceirosSubject.value;
    const index = dadosAtuais.findIndex(d => d.servicoId === servicoId);
    
    if (index !== -1) {
      dadosAtuais[index] = {
        ...dadosAtuais[index],
        ...dadoAtualizado
      };
      this.dadosFinanceirosSubject.next([...dadosAtuais]);
    }
  }

  excluirDadoFinanceiro(servicoId: string): void {
    const dadosAtuais = this.dadosFinanceirosSubject.value;
    const dadosFiltrados = dadosAtuais.filter(d => d.servicoId !== servicoId);
    this.dadosFinanceirosSubject.next(dadosFiltrados);
  }

  // Cálculos e análises
  calcularTotalPorPolicial(policial: string): number {
    return this.dadosFinanceirosSubject.value
      .filter(d => d.policial === policial)
      .reduce((total, d) => total + d.valorTotal, 0);
  }

  calcularProgressoMeta(metaId: string): { percentual: number, valorRestante: number, servicosRestantes: number } {
    const meta = this.metasSubject.value.find(m => m.id === metaId);
    if (!meta) return { percentual: 0, valorRestante: 0, servicosRestantes: 0 };

    const valorAtual = this.calcularTotalPorPolicial(meta.policial);
    const percentual = Math.min((valorAtual / meta.valorMeta) * 100, 100);
    const valorRestante = Math.max(meta.valorMeta - valorAtual, 0);
    
    // Calcular serviços restantes baseado nos tipos preferidos
    const valores = this.getValoresPorTipo();
    let valorMedioHora = 65; // Valor padrão RAS voluntário
    
    if (meta.tiposServicoPreferidos.length > 0) {
      const valoresPreferidos = meta.tiposServicoPreferidos.map(tipo => {
        if (tipo.includes('ras-voluntario')) return 75; // Média entre batalhão e projeto
        if (tipo.includes('ras-compulsorio')) return 42.5; // Média entre padrão e troca
        if (tipo.includes('ordinario')) return 25; // Valor troca
        return 65;
      });
      valorMedioHora = valoresPreferidos.reduce((a, b) => a + b, 0) / valoresPreferidos.length;
    }
    
    const servicosRestantes = Math.ceil(valorRestante / (valorMedioHora * 6)); // Assumindo 6h por serviço

    return { percentual, valorRestante, servicosRestantes };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getMetasIniciais(): MetaFinanceira[] {
    return [
      {
        id: 'meta1',
        policial: 'João Silva',
        titulo: 'Comprar uma moto',
        valorMeta: 15000,
        prazoMeta: new Date('2025-03-15'),
        valorAtual: 11250,
        servicosRealizados: 23,
        servicosNecessarios: 8,
        status: 'ativa',
        tiposServicoPreferidos: ['ras-voluntario-batalhao', 'ordinario-troca'],
        criadaEm: new Date('2024-12-01'),
        atualizadaEm: new Date()
      },
      {
        id: 'meta2',
        policial: 'Maria Santos',
        titulo: 'Curso de especialização',
        valorMeta: 3500,
        prazoMeta: new Date('2025-02-28'),
        valorAtual: 3500,
        servicosRealizados: 15,
        servicosNecessarios: 0,
        status: 'concluida',
        tiposServicoPreferidos: ['ras-voluntario-projeto'],
        criadaEm: new Date('2024-11-15'),
        atualizadaEm: new Date()
      }
    ];
  }

  private getDadosFinanceirosIniciais(): DadosFinanceiros[] {
    return [
      {
        servicoId: 'fin1',
        policial: 'João Silva',
        tipoServico: 'ras-voluntario',
        subtipo: 'batalhao',
        horas: 6,
        valorHora: 65,
        valorTotal: 390,
        dataServico: new Date('2025-01-15'),
        statusPagamento: 'pago'
      },
      {
        servicoId: 'fin2',
        policial: 'Maria Santos',
        tipoServico: 'ras-voluntario',
        subtipo: 'projeto-especial',
        horas: 8,
        valorHora: 85,
        valorTotal: 680,
        dataServico: new Date('2025-01-18'),
        statusPagamento: 'pendente'
      },
      {
        servicoId: 'fin3',
        policial: 'Pedro Costa',
        tipoServico: 'ras-compulsorio',
        horas: 12,
        valorHora: 45,
        valorTotal: 540,
        dataServico: new Date('2025-01-20'),
        statusPagamento: 'processando'
      },
      {
        servicoId: 'fin4',
        policial: 'Ana Oliveira',
        tipoServico: 'ras-compulsorio',
        subtipo: 'compulsorio-troca',
        horas: 12,
        valorHora: 40,
        valorTotal: 480,
        dataServico: new Date('2025-01-22'),
        statusPagamento: 'pago'
      },
      {
        servicoId: 'fin5',
        policial: 'Carlos Lima',
        tipoServico: 'ordinario',
        subtipo: 'batalhao',
        horas: 8,
        valorHora: 35,
        valorTotal: 280,
        dataServico: new Date('2025-01-10'),
        statusPagamento: 'pago'
      },
      {
        servicoId: 'fin6',
        policial: 'Lucia Ferreira',
        tipoServico: 'ordinario',
        subtipo: 'projeto-especial',
        horas: 6,
        valorHora: 42,
        valorTotal: 252,
        dataServico: new Date('2025-01-12'),
        statusPagamento: 'pendente'
      },
      {
        servicoId: 'fin7',
        policial: 'Roberto Souza',
        tipoServico: 'ras-compulsorio',
        horas: 24,
        valorHora: 45,
        valorTotal: 1080,
        dataServico: new Date('2025-01-25'),
        statusPagamento: 'pendente'
      }
    ];
  }
}
