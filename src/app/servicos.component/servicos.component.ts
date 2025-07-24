import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ResumoServicos {
  ordinarios: {
    total: number;
    escala: string;
    periodo: string;
  };
  rasVoluntario: {
    total: number;
    horas: number;
    modalidade: string;
  };
  rasCompulsorio: {
    total: number;
    horas: number;
    modalidade: string;
  };
}

interface Servico {
  id: number;
  tipo: string;
  data: Date;
  horarioInicio: string;
  horarioFim: string;
  duracao: number;
  periodo: string;
  local?: string;
  observacoes?: string;
  status: string;
  escala?: string;
}

@Component({
  selector: 'app-servicos',
  imports: [CommonModule, RouterModule],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.scss'
})
export class ServicosComponent {
  
  resumoServicos: ResumoServicos = {
    ordinarios: {
      total: 18,
      escala: '12x36',
      periodo: 'Diurno/Noturno'
    },
    rasVoluntario: {
      total: 6,
      horas: 72,
      modalidade: '12h/8h - Diurno/Noturno'
    },
    rasCompulsorio: {
      total: 2,
      horas: 24,
      modalidade: '12h/8h - Diurno/Noturno'
    }
  };

  proximosServicos: Servico[] = [
    {
      id: 1,
      tipo: 'Serviço Ordinário',
      data: new Date('2025-07-24'),
      horarioInicio: '06:00',
      horarioFim: '18:00',
      duracao: 12,
      periodo: 'Diurno',
      local: '1º BPM - Patrulhamento',
      status: 'Confirmado',
      escala: '12x36'
    },
    {
      id: 2,
      tipo: 'RAS Voluntário',
      data: new Date('2025-07-26'),
      horarioInicio: '18:00',
      horarioFim: '06:00',
      duracao: 12,
      periodo: 'Noturno',
      local: 'COPOM - Central de Operações',
      status: 'Agendado'
    },
    {
      id: 3,
      tipo: 'RAS Compulsório',
      data: new Date('2025-07-28'),
      horarioInicio: '08:00',
      horarioFim: '16:00',
      duracao: 8,
      periodo: 'Diurno',
      local: 'Centro - Policiamento Ostensivo',
      status: 'Pendente'
    }
  ];

  openCadastroServico(): void {
    // Implementar abertura do modal/navegação para cadastro
    console.log('Abrir cadastro de serviço');
  }

  getTotalRasHoras(): number {
    return this.resumoServicos.rasVoluntario.horas + this.resumoServicos.rasCompulsorio.horas;
  }

  getTotalRasServicos(): number {
    return this.resumoServicos.rasVoluntario.total + this.resumoServicos.rasCompulsorio.total;
  }

  getHorasDisponiveis(): number {
    return 120 - this.getTotalRasHoras();
  }

  isProximoLimite(): boolean {
    return this.getTotalRasHoras() >= 96 && this.getTotalRasHoras() < 114;
  }

  isLimiteExcedido(): boolean {
    return this.getTotalRasHoras() >= 114;
  }

  getCurrentMonth(): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[new Date().getMonth()];
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getTotalServicos(): number {
    return this.resumoServicos.ordinarios.total + this.getTotalRasServicos();
  }

  getHorasTrabalhadasMes(): string {
    const ordinarioHoras = this.resumoServicos.ordinarios.total * 12; // Assumindo 12h por serviço ordinário
    const totalHoras = ordinarioHoras + this.getTotalRasHoras();
    return `${totalHoras}h`;
  }

  getProximosServicos(): Servico[] {
    return this.proximosServicos.sort((a, b) => a.data.getTime() - b.data.getTime());
  }

  getServiceIcon(tipoServico: string): string {
    switch (tipoServico) {
      case 'Serviço Ordinário':
        return 'fas fa-shield-alt';
      case 'RAS Voluntário':
        return 'fas fa-hand-paper';
      case 'RAS Compulsório':
        return 'fas fa-exclamation-circle';
      default:
        return 'fas fa-clock';
    }
  }

  getServiceIconClass(tipoServico: string): string {
    switch (tipoServico) {
      case 'Serviço Ordinário':
        return 'success';
      case 'RAS Voluntário':
        return 'info';
      case 'RAS Compulsório':
        return 'warning';
      default:
        return 'primary';
    }
  }

  formatDate(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long',
        day: '2-digit',
        month: '2-digit'
      });
    }
  }

  viewAllServices(): void {
    // Implementar navegação para lista completa
    console.log('Ver todos os serviços');
  }
}
