import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioEvento } from './formulario-evento';

describe('FormularioEvento', () => {
  let component: FormularioEvento;
  let fixture: ComponentFixture<FormularioEvento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioEvento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioEvento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
