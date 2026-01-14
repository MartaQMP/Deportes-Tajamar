import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoginService } from '../../services/login';
import { FormsModule } from '@angular/forms';
import { Login } from '../../models/login';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.css',
})
export class InicioSesion implements OnInit {
  dominio: string = '@tajamar365.com';
  contraseniaOculta: boolean = false;
  @ViewChild('username') username!: ElementRef;
  @ViewChild('password') password!: ElementRef;

  constructor(private _service: LoginService, private _route: Router) {}

  //No funciona la API con esto al menos entramos a la Home
  //Quitar cuando funcione la API
  ngOnInit(): void {
    this._route.navigate(['/deportes/']);
  }

  cambiarEstadoContrasenia(): void {
    this.contraseniaOculta = !this.contraseniaOculta;
  }

  login(): void {
    let login: Login = {
      userName: this.username.nativeElement.value + this.dominio,
      password: this.password.nativeElement.value,
    };

    this._service.crearToken(login).subscribe({
      next: (response) => {
        console.log(response.response);
        localStorage.clear();
        localStorage.setItem('token', response.response);
        this._route.navigate(['/deportes/']);
      },
      error: (error) => {
        Swal.fire({
          title: 'Error al iniciar sesion',
          text: 'Por favor, revisa tus credenciales',
          icon: 'error',
        });
      },
    });
  }
}
