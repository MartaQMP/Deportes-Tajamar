import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pagos } from './pagos';

describe('Pagos', () => {
  let component: Pagos;
  let fixture: ComponentFixture<Pagos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pagos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
