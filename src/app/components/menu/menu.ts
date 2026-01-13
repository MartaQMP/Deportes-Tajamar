import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  constructor(private _router: Router) {}

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this._router.navigate(['/inicio-sesion']);
  }
}
