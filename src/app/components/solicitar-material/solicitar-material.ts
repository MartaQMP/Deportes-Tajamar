import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, Params } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import Material from '../../models/material';
import MaterialesService from '../../services/materiales.service';

@Component({
  selector: 'app-solicitar-material',
  imports: [CommonModule],
  templateUrl: './solicitar-material.html',
  styleUrl: './solicitar-material.css',
  providers: [MaterialesService]
})
export class SolicitarMaterial implements OnInit {

  public idEvento!: number;
  public materialesEvento!: Array<Material>;

constructor(private _service: MaterialesService, private _activateRoute: ActivatedRoute){}

ngOnInit(): void {
  this._activateRoute.params.subscribe((params: Params)=>{
      this.idEvento = params["idEvento"];
  })

  this._service.getMaterialesActividad(this.idEvento).subscribe((response)=>{
    this.materialesEvento = response;
    console.log(this.materialesEvento);
  })

}

// Contar materiales pendientes
contarPendientes(): number {
  if (!this.materialesEvento) return 0;
  return this.materialesEvento.filter(m => m.pendiente).length;
}

// Contar materiales completados
contarCompletados(): number {
  if (!this.materialesEvento) return 0;
  return this.materialesEvento.filter(m => !m.pendiente).length;
}

}
