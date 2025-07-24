import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroRasComponent } from './cadastro-ras.component';

describe('CadastroRasComponent', () => {
  let component: CadastroRasComponent;
  let fixture: ComponentFixture<CadastroRasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroRasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroRasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
