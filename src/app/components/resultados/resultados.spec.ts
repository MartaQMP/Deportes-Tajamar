import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Resultados } from './resultados';

describe('Resultados', () => {
  let component: Resultados;
  let fixture: ComponentFixture<Resultados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Resultados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Resultados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
