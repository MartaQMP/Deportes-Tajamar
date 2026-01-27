import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Equipos } from './equipos';

describe('Equipos', () => {
  let component: Equipos;
  let fixture: ComponentFixture<Equipos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Equipos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Equipos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
