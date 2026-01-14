import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  CalendarEvent,
  CalendarView,
  CalendarModule
} from 'angular-calendar';
import { startOfDay, endOfDay } from 'date-fns';
import PerfilService from '../../services/perfil.service';
import { Router } from '@angular/router';
import usuarioLogeado from '../../models/usuarioLogeado';
import { EventosService } from '../../services/eventos.service';
import Evento from '../../models/evento';
import { Subject } from 'rxjs'; 
import ActividadEvento from '../../models/actividades';
import { ActividadesService } from '../../services/actividades.service';
import { InscripcionService } from '../../services/inscripcion.service';
import Inscripciones from '../../models/inscripciones';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  
  refresh: Subject<void> = new Subject<void>(); 

  events: CalendarEvent[] = []; 

  public usuario!: usuarioLogeado;
  public usuarioLogeado: boolean = false;
  public eventos: Evento[] = [];
  public actividades: ActividadEvento[]=[];
  public personasInscritas: number[]=[];
  public contador: number=0;

  constructor(
    private _perfil: PerfilService, 
    private _eventos: EventosService, 
    private _actividades: ActividadesService,
    private _router: Router,
    private _inscripciones: InscripcionService
  ) { }

  setView(view: CalendarView) {
    this.view = view;
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action, event);
  }

  ngOnInit(): void {

    //Login con el token para recoger el nombre de usuario

    const token = localStorage.getItem("token");

    if (!token) {
      this._router.navigate(['/login']);
      return; 
    }

    this._perfil.getDatosUsuario(token).subscribe((response) => {
      this.usuarioLogeado = true;
      this.usuario = response;
    });

    //Llamada al api eventos para recoger los eventos abiertos e incluirlos en el calendario

    this._eventos.buscarEventosAbiertos().subscribe({
      next: (response) => {
        this.eventos = response;

        const nuevosEventos: CalendarEvent[] = this.eventos.map(eventoApi => {
          return {
            start: new Date(eventoApi.fechaEvento),
            title: 'Evento #'+eventoApi.idEvento, 
            color: { primary: '#ad2121', secondary: '#FAE3E3' },
            meta: eventoApi 
          };
        });

        this.events = nuevosEventos;

        this.refresh.next(); 
      },
      error: (err) => {
        console.error("Error cargando eventos", err);
      }
    });

    
  }
  
  //Llamada al api Actividades por evento para recoger las actividades disponibles por cada evento
  MostrarActividades(e:Evento){
    console.log(e);
    this._actividades.buscarActividadesPorEventos(e.idEvento.toString()).subscribe((response)=>{
      this.actividades = response;
      //Ver las inscripciones a esa actividad en ese evento
      this.actividades.forEach((a, index) =>{
        this._inscripciones.verInscripciones(e.idEvento, a.idActividad).subscribe(response=>{
          this.personasInscritas[index] = response.length;
        })
        this.personasInscritas.reverse()
      })
    })
  }
}