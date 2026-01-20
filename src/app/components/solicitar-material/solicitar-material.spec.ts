import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarMaterial } from './solicitar-material';

describe('SolicitarMaterial', () => {
  let component: SolicitarMaterial;
  let fixture: ComponentFixture<SolicitarMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarMaterial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitarMaterial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
