import { Injectable } from '@angular/core';

export interface ServicoBase {
  id: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: 'ordinario' | 'voluntario' | 'compulsorio' | 'troca-ordinario' | 'troca-ras';
  tipoEvento?: 'servico' | 'troca' | 'ordinario';
}

export interface ConflictDetail {
  id: string;
  type: 'day-overlap-forbidden' | 'insufficient-interval' | 'time-overlap';
  severity: 'error' | 'warning';
  servicos: ServicoBase[];
  rule: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  conflicts: ConflictDetail[];
  allowedExceptions: ConflictDetail[];
}

@Injectable({
  providedIn: 'root'
})
export class ConflictValidationService {

  private readonly MINIMUM_INTERVAL_HOURS = 8;
  
  private readonly CONFLICT_MESSAGES = {
    'day-overlap-forbidden': 'Sobreposição no mesmo dia não permitida para estes tipos de serviço',
    'insufficient-interval': 'Intervalo mínimo de 8 horas não respeitado entre os serviços',
    'time-overlap': 'Horários se sobrepõem no mesmo período',
    'ordinario-ras-voluntario-allowed': 'Combinação Ordinário → RAS Voluntário permitida (exceção)'
  };

  constructor() { }

  /**
   * Valida conflitos entre uma lista de serviços
   */
  validateServiceConflicts(servicos: ServicoBase[]): ValidationResult {
    const conflicts: ConflictDetail[] = [];
    const allowedExceptions: ConflictDetail[] = [];
    
    // Ordenar serviços por data e hora
    const servicosOrdenados = this.sortServicesByDateTime(servicos);
    
    // Validar cada par de serviços
    for (let i = 0; i < servicosOrdenados.length; i++) {
      for (let j = i + 1; j < servicosOrdenados.length; j++) {
        const servico1 = servicosOrdenados[i];
        const servico2 = servicosOrdenados[j];
        
        // Verificar se é a exceção permitida (Ordinário → RAS Voluntário)
        if (this.isOrdinarioToRasVoluntarioException(servico1, servico2)) {
          allowedExceptions.push({
            id: `exception-${servico1.id}-${servico2.id}`,
            type: 'day-overlap-forbidden',
            severity: 'warning',
            servicos: [servico1, servico2],
            rule: 'ordinario-ras-voluntario-exception',
            message: this.CONFLICT_MESSAGES['ordinario-ras-voluntario-allowed'],
            suggestion: 'Esta combinação é permitida pelas regras do sistema'
          });
          continue;
        }
        
        // Verificar sobreposição de dia proibida
        const dayOverlapConflict = this.checkDayOverlapRules(servico1, servico2);
        if (dayOverlapConflict) {
          conflicts.push(dayOverlapConflict);
          continue; // Se há sobreposição de dia proibida, não precisa verificar intervalo
        }
        
        // Verificar intervalo de tempo
        const timeIntervalConflict = this.checkTimeIntervalRules(servico1, servico2);
        if (timeIntervalConflict) {
          conflicts.push(timeIntervalConflict);
        }
      }
    }
    
    return {
      isValid: conflicts.length === 0,
      hasErrors: conflicts.some(c => c.severity === 'error'),
      hasWarnings: conflicts.some(c => c.severity === 'warning') || allowedExceptions.length > 0,
      conflicts,
      allowedExceptions
    };
  }

  /**
   * Verifica regras de sobreposição de dia
   */
  private checkDayOverlapRules(servico1: ServicoBase, servico2: ServicoBase): ConflictDetail | null {
    // Se não são do mesmo dia, não há conflito de sobreposição
    if (servico1.data !== servico2.data) {
      return null;
    }
    
    // Verificar se é a exceção permitida
    if (this.isOrdinarioToRasVoluntarioException(servico1, servico2)) {
      return null;
    }
    
    // Todas as outras combinações no mesmo dia são proibidas
    return {
      id: `day-overlap-${servico1.id}-${servico2.id}`,
      type: 'day-overlap-forbidden',
      severity: 'error',
      servicos: [servico1, servico2],
      rule: 'same-day-overlap-forbidden',
      message: `${this.CONFLICT_MESSAGES['day-overlap-forbidden']}: ${this.formatTipoServico(servico1.tipo)} e ${this.formatTipoServico(servico2.tipo)}`,
      suggestion: 'Mova um dos serviços para outro dia ou cancele um deles'
    };
  }

  /**
   * Verifica regras de intervalo de tempo
   */
  private checkTimeIntervalRules(servico1: ServicoBase, servico2: ServicoBase): ConflictDetail | null {
    // Se é a exceção Ordinário → RAS Voluntário, não precisa de intervalo
    if (this.isOrdinarioToRasVoluntarioException(servico1, servico2)) {
      return null;
    }
    
    // Calcular intervalo entre os serviços
    const intervaloHoras = this.calculateTimeBetween(servico1, servico2);
    
    // Verificar se precisa de intervalo mínimo
    if (this.needsMinimumInterval(servico1.tipo, servico2.tipo)) {
      if (intervaloHoras < this.MINIMUM_INTERVAL_HOURS) {
        return {
          id: `interval-${servico1.id}-${servico2.id}`,
          type: 'insufficient-interval',
          severity: 'error',
          servicos: [servico1, servico2],
          rule: 'minimum-8-hour-interval',
          message: `${this.CONFLICT_MESSAGES['insufficient-interval']}: ${intervaloHoras.toFixed(1)}h encontrado, ${this.MINIMUM_INTERVAL_HOURS}h necessário`,
          suggestion: `Ajuste os horários para ter pelo menos ${this.MINIMUM_INTERVAL_HOURS} horas de intervalo`
        };
      }
    }
    
    return null;
  }

  /**
   * Verifica se é a exceção permitida: Ordinário → RAS Voluntário
   */
  private isOrdinarioToRasVoluntarioException(servico1: ServicoBase, servico2: ServicoBase): boolean {
    // Deve ser no mesmo dia
    if (servico1.data !== servico2.data) {
      return false;
    }
    
    // Deve ser Ordinário seguido de RAS Voluntário (na ordem cronológica)
    const isOrdinarioFirst = servico1.tipo === 'ordinario' && servico2.tipo === 'voluntario';
    const isVoluntarioFirst = servico1.tipo === 'voluntario' && servico2.tipo === 'ordinario';
    
    if (isOrdinarioFirst) {
      // Ordinário deve terminar antes do RAS Voluntário começar
      return this.convertTimeToMinutes(servico1.horaFim) <= this.convertTimeToMinutes(servico2.horaInicio);
    }
    
    if (isVoluntarioFirst) {
      // RAS Voluntário deve terminar antes do Ordinário começar
      return this.convertTimeToMinutes(servico1.horaFim) <= this.convertTimeToMinutes(servico2.horaInicio);
    }
    
    return false;
  }

  /**
   * Verifica se dois tipos de serviço precisam de intervalo mínimo
   */
  private needsMinimumInterval(tipo1: string, tipo2: string): boolean {
    const tiposQueNecessitamIntervalo = ['voluntario', 'compulsorio'];
    
    return tiposQueNecessitamIntervalo.includes(tipo1) || 
           tiposQueNecessitamIntervalo.includes(tipo2);
  }

  /**
   * Calcula o tempo entre dois serviços em horas
   */
  private calculateTimeBetween(servico1: ServicoBase, servico2: ServicoBase): number {
    const data1 = new Date(servico1.data);
    const data2 = new Date(servico2.data);
    
    // Se são dias diferentes, calcular considerando a diferença de dias
    const diffDias = Math.abs(data2.getTime() - data1.getTime()) / (1000 * 60 * 60 * 24);
    
    let fimPrimeiro: number;
    let inicioSegundo: number;
    
    if (servico1.data === servico2.data) {
      // Mesmo dia
      fimPrimeiro = this.convertTimeToMinutes(servico1.horaFim);
      inicioSegundo = this.convertTimeToMinutes(servico2.horaInicio);
    } else {
      // Dias diferentes - determinar qual é o primeiro cronologicamente
      const primeiroServico = data1 <= data2 ? servico1 : servico2;
      const segundoServico = data1 <= data2 ? servico2 : servico1;
      
      fimPrimeiro = this.convertTimeToMinutes(primeiroServico.horaFim);
      inicioSegundo = this.convertTimeToMinutes(segundoServico.horaInicio) + (diffDias * 24 * 60);
    }
    
    const diferencaMinutos = inicioSegundo - fimPrimeiro;
    return Math.max(0, diferencaMinutos / 60);
  }

  /**
   * Converte hora (HH:MM) para minutos desde meia-noite
   */
  private convertTimeToMinutes(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  /**
   * Ordena serviços por data e hora
   */
  private sortServicesByDateTime(servicos: ServicoBase[]): ServicoBase[] {
    return [...servicos].sort((a, b) => {
      const dataA = new Date(a.data + 'T' + a.horaInicio);
      const dataB = new Date(b.data + 'T' + b.horaInicio);
      return dataA.getTime() - dataB.getTime();
    });
  }

  /**
   * Formata tipo de serviço para exibição
   */
  private formatTipoServico(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'ordinario': 'Serviço Ordinário',
      'voluntario': 'RAS Voluntário',
      'compulsorio': 'RAS Compulsório',
      'troca-ordinario': 'Troca Ordinário',
      'troca-ras': 'Troca RAS'
    };
    
    return tipos[tipo] || tipo;
  }

  /**
   * Valida um único serviço contra uma lista existente
   */
  validateSingleService(novoServico: ServicoBase, servicosExistentes: ServicoBase[]): ValidationResult {
    const todosServicos = [...servicosExistentes, novoServico];
    return this.validateServiceConflicts(todosServicos);
  }

  /**
   * Obtém sugestões para resolver conflitos
   */
  getSuggestionsForConflict(conflict: ConflictDetail): string[] {
    const suggestions: string[] = [];
    
    switch (conflict.type) {
      case 'day-overlap-forbidden':
        suggestions.push('Mover um dos serviços para outro dia');
        suggestions.push('Cancelar um dos serviços conflitantes');
        suggestions.push('Verificar se pode ser transformado na exceção Ordinário → RAS Voluntário');
        break;
        
      case 'insufficient-interval':
        suggestions.push(`Aumentar o intervalo para pelo menos ${this.MINIMUM_INTERVAL_HOURS} horas`);
        suggestions.push('Ajustar os horários de início/fim');
        suggestions.push('Redistribuir os serviços em dias diferentes');
        break;
        
      case 'time-overlap':
        suggestions.push('Ajustar os horários para evitar sobreposição');
        suggestions.push('Reduzir a duração de um dos serviços');
        break;
    }
    
    return suggestions;
  }
}
