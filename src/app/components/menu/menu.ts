import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import PerfilService from '../../services/perfil.service';
import usuarioLogeado from '../../models/usuarioLogeado';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  public usuarioLogueado!: usuarioLogeado;
  public ideventoactividad: number | null = null;
  public soyCapitan!: boolean;

  constructor(
    private _router: Router,
    private _perfilservice: PerfilService,
    private _menuservice: MenuService,
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this._router.navigate(['/login']);
      return;
    }

    
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this._router.navigate(['/inicio-sesion']);
  }
}
