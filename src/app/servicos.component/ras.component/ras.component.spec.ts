import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ras } from './ras';

describe('Ras', () => {
  let component: Ras;
  let fixture: ComponentFixture<Ras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ras]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ras);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
