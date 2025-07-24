import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CronogramaUnificadoComponent, ServicoAgendado } from './cronograma-unificado.component';

describe('CronogramaUnificadoComponent', () => {
  let component: CronogramaUnificadoComponent;
  let fixture: ComponentFixture<CronogramaUnificadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CronogramaUnificadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CronogramaUnificadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect overlap conflict between RAS Compulsório and other services', () => {
    const servicos: ServicoAgendado[] = [
      {
        id: '1',
        tipo: 'ras-compulsorio',
        data: new Date('2024-01-15'),
        horaInicio: '08:00',
        horaFim: '16:00',
        policial: 'João Silva'
      },
      {
        id: '2',
        tipo: 'ordinario',
        data: new Date('2024-01-15'),
        horaInicio: '14:00',
        horaFim: '22:00',
        policial: 'João Silva'
      }
    ];

    component.servicos = servicos;
    component.ngOnInit();

    expect(component.conflitos.length).toBe(1);
    expect(component.conflitos[0].tipo).toBe('sobreposicao');
  });

  it('should allow overlap between Ordinário and RAS Voluntário', () => {
    const servicos: ServicoAgendado[] = [
      {
        id: '1',
        tipo: 'ordinario',
        data: new Date('2024-01-15'),
        horaInicio: '06:00',
        horaFim: '14:00',
        policial: 'João Silva'
      },
      {
        id: '2',
        tipo: 'ras-voluntario',
        data: new Date('2024-01-15'),
        horaInicio: '14:00',
        horaFim: '22:00',
        policial: 'João Silva'
      }
    ];

    component.servicos = servicos;
    component.ngOnInit();

    expect(component.conflitos.length).toBe(0);
  });

  it('should detect insufficient rest period (less than 8 hours)', () => {
    const servicos: ServicoAgendado[] = [
      {
        id: '1',
        tipo: 'ordinario',
        data: new Date('2024-01-15'),
        horaInicio: '06:00',
        horaFim: '14:00',
        policial: 'João Silva'
      },
      {
        id: '2',
        tipo: 'ras-voluntario',
        data: new Date('2024-01-16'),
        horaInicio: '18:00',
        horaFim: '02:00',
        policial: 'João Silva'
      }
    ];

    component.servicos = servicos;
    component.ngOnInit();

    expect(component.conflitos.length).toBe(1);
    expect(component.conflitos[0].tipo).toBe('descanso-insuficiente');
  });

  it('should generate correct weekly days', () => {
    component.dataInicial = new Date('2024-01-15'); // Segunda-feira
    component.modoVisualizacao = 'semanal';
    component.ngOnInit();

    expect(component.diasExibicao.length).toBe(7);
    expect(component.diasExibicao[0].getDay()).toBe(0); // Domingo
  });

  it('should filter services by displayed types', () => {
    const servicos: ServicoAgendado[] = [
      {
        id: '1',
        tipo: 'ordinario',
        data: new Date('2024-01-15'),
        horaInicio: '06:00',
        horaFim: '14:00',
        policial: 'João Silva'
      },
      {
        id: '2',
        tipo: 'ras-voluntario',
        data: new Date('2024-01-15'),
        horaInicio: '14:00',
        horaFim: '22:00',
        policial: 'Maria Santos'
      }
    ];

    component.servicos = servicos;
    component.exibirTipos = ['ordinario'];
    
    const servicosFiltrados = component.getServicosPorDiaHora(new Date('2024-01-15'), '08:00');
    expect(servicosFiltrados.length).toBe(1);
    expect(servicosFiltrados[0].tipo).toBe('ordinario');
  });
});
