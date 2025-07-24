import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroOrdinarioComponent } from './cadastro-ordinario.component';

describe('CadastroOrdinarioComponent', () => {
  let component: CadastroOrdinarioComponent;
  let fixture: ComponentFixture<CadastroOrdinarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroOrdinarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroOrdinarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
