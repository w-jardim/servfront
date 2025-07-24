import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroservicosComponet } from './cadastroservicos.componet';

describe('CadastroservicosComponet', () => {
  let component: CadastroservicosComponet;
  let fixture: ComponentFixture<CadastroservicosComponet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroservicosComponet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroservicosComponet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
