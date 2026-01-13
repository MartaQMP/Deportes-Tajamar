import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  CalendarEvent,
  CalendarView,
  CalendarModule, // <--- Solo deja este, borra los tachados
} from 'angular-calendar';
import { startOfDay, endOfDay } from 'date-fns';
import PerfilService from '../../services/perfil.service';
import usuarioLogeado from '../../models/usuarioLogeado';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, // Necesario para el ngSwitch del HTML
    CalendarModule, // Este trae los componentes <mwl-calendar-month-view>, etc.
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  // ... (El resto de tu código se queda igual)
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  public usuario!: usuarioLogeado;
  public usuarioLogeado: boolean = false;

  constructor(private _service: PerfilService, private _router: Router) {}

  events: CalendarEvent[] = [
    {
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      title: 'Evento importante',
      color: { primary: '#ad2121', secondary: '#FAE3E3' },
      draggable: false,
      resizable: { beforeStart: false, afterEnd: false },
    },
  ];

  setView(view: CalendarView) {
    this.view = view;
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action, event);
  }

  ngOnInit(): void {
    if (localStorage.getItem('token') == null) {
      this._router.navigate(['/login']);
    } else {
      const token = localStorage.getItem('token');

      if (token != null) {
        this._service.getDatosUsuario(token).subscribe((response) => {
          console.log(response);
          this.usuarioLogeado = true;
          this.usuario = response;
        });
      }
    }
  }
}
