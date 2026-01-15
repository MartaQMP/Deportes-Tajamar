import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cursos } from './cursos';

describe('Cursos', () => {
  let component: Cursos;
  let fixture: ComponentFixture<Cursos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cursos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cursos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
