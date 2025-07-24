import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ordinario } from './ordinario';

describe('Ordinario', () => {
  let component: Ordinario;
  let fixture: ComponentFixture<Ordinario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ordinario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ordinario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
