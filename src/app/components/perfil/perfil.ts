import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import PerfilService from '../../services/perfil.service';
import usuarioLogeado from '../../models/usuarioLogeado';
import { Router } from '@angular/router';
import UsuarioActividad from '../../models/usuarioActividad';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
  providers: [PerfilService]
})
export class Perfil implements OnInit {

  public usuario!: usuarioLogeado
  public usuarioLogeado: boolean
  public actividadesUsuario!: Array<UsuarioActividad>;
  constructor(private _service: PerfilService, private _router: Router) {
    this.usuarioLogeado = false;
  }

  ngOnInit(): void {
    if (localStorage.getItem("token") == null) {
      this._router.navigate(['/login'])
    } else {

      const token = localStorage.getItem("token");

      if (token != null) {
        this.usuarioLogeado = true;

        this._service.getDatosUsuario(token).subscribe((response) => {
          this.usuario = response
        })

        this._service.getActividadesUsuario(token).subscribe((response) => {
          this.actividadesUsuario = response as unknown as Array<UsuarioActividad>;
        })
      }

    }
  }

}
