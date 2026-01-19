import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView, CalendarModule } from 'angular-calendar';
import { startOfDay, endOfDay } from 'date-fns';
import PerfilService from '../../services/perfil.service';
import { Router, RouterModule } from '@angular/router';
import usuarioLogeado from '../../models/usuarioLogeado';
import { EventosService } from '../../services/eventos.service';
import Evento from '../../models/evento';
import { forkJoin, Subject } from 'rxjs';
import ActividadEvento from '../../models/actividades';
import { ActividadesService } from '../../services/actividades.service';
import { InscripcionService } from '../../services/inscripcion.service';
import { FormsModule } from '@angular/forms';
import UsuarioActividad from '../../models/usuarioActividad';
import Alumno from '../../models/alumno';
import Capitan from '../../models/capitan';
import ActividadesEvento from '../../models/actividadesevento';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, RouterModule],
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
  public actividades: ActividadEvento[] = [];
  public personasInscritas: number[] = [];
  public contador: number = 0;
  public capitan: boolean = false;
  public idEventoSeleccionado!: number;
  public validarBoton: boolean = true;
  public eventoSeleccionado: boolean = false;
  public usuarioActividades: UsuarioActividad[] = [];
  public usuarioCapitan!: Alumno;

  constructor(
    private _perfil: PerfilService,
    private _eventos: EventosService,
    private _actividades: ActividadesService,
    private _router: Router,
    private _inscripciones: InscripcionService,
  ) {}

  setView(view: CalendarView) {
    this.view = view;
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action, event);
  }

  ngOnInit(): void {
    //Login con el token para recoger el nombre de usuario

    const token = localStorage.getItem('token');

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

        const nuevosEventos: CalendarEvent[] = this.eventos.map((eventoApi) => {
          return {
            start: new Date(eventoApi.fechaEvento),
            title: 'Evento #' + eventoApi.idEvento,
            color: { primary: '#ad2121', secondary: '#FAE3E3' },
            meta: eventoApi,
          };
        });

        this.events = nuevosEventos;

        this.refresh.next();
      },
      error: (err) => {
        console.error('Error cargando eventos', err);
      },
    });
  }

  //Llamada al api Actividades por evento para recoger las actividades disponibles por cada evento
  MostrarActividades(e: Evento) {
    console.log(e);
    this.eventoSeleccionado = true;
    this.idEventoSeleccionado = e.idEvento;
    this._actividades.buscarActividadesPorEventos(e.idEvento.toString()).subscribe((response) => {
      this.actividades = response;
      //Ver las inscripciones a esa actividad en ese evento
      this.actividades.forEach((a, index) => {
        this._inscripciones.verInscripciones(e.idEvento, a.idActividad).subscribe((response) => {
          this.personasInscritas[index] = response.length;
        });
        this.personasInscritas.reverse();
      });

      //ver si el usuario esta inscrito ya en alguna actividad de ese evento
      this.verInscripciones();
    });
  }
  verInscripciones() {
    this._actividades.verUsuarioApuntado().subscribe((response) => {
      this.usuarioActividades = response;
      console.log(this.usuarioActividades);
    });
  }

  yaEstaInscrito(idEvento: number): boolean {
    return this.usuarioActividades.some((actividad) => actividad.idEvento === idEvento);
  }

  Inscribirse(e: ActividadEvento) {
    this._inscripciones
      .inscribirActividadEvento(this.usuario.idUsuario, e.idEventoActividad, this.capitan)
      .subscribe((response) => {
        this.verInscripciones();
        this.actividades.forEach((a, index) => {
          this._inscripciones.verInscripciones(e.idEvento, a.idActividad).subscribe((response) => {
            this.personasInscritas[index] = response.length;
          });
          this.personasInscritas.reverse();
        });
        this.comprobarSiHacerSorteoYHacerlo(e.idEvento, this.usuario.idCurso);
      });
  }

  elegirCapitan(idActividad: number, idEvento: number) {
    this._inscripciones
      .buscarActividadEvento(idEvento, idActividad)
      .subscribe((eventoActividad) => {
        if (eventoActividad) {
          this._inscripciones
            .getUsuariosCapitanEventoActividad(idEvento, idActividad)
            .subscribe((voluntarios) => {
              if (voluntarios.length > 0) {
                const index = Math.floor(Math.random() * voluntarios.length);
                this.usuarioCapitan = voluntarios[index];
              } else {
                this._inscripciones.verInscripciones(idEvento, idActividad).subscribe((todos) => {
                  if (todos.length > 0) {
                    const index = Math.floor(Math.random() * todos.length);
                    this.usuarioCapitan = todos[index];

                    let capitan: Capitan = {
                      idCapitanActividad: 0,
                      idEventoActividad: eventoActividad.idEventoActividad,
                      idUsuario: this.usuarioCapitan.idUsuario,
                    };
                    this._inscripciones.crearCapitan(capitan).subscribe();
                  }
                });
                return;
              }

              if (this.usuarioCapitan) {
                let capitan: Capitan = {
                  idCapitanActividad: 0,
                  idEventoActividad: eventoActividad.idEventoActividad,
                  idUsuario: this.usuarioCapitan.idUsuario,
                };
                this._inscripciones.crearCapitan(capitan).subscribe();
              }
            });
        }
      });
  }

  comprobarSiHacerSorteoYHacerlo(idEvento: number, idCurso: number) {
    forkJoin({
      inscritos: this._inscripciones.getUsuariosInscritosEventoCurso(idEvento, idCurso),
      totales: this._inscripciones.getUsuariosCurso(idCurso),
    }).subscribe(({ inscritos, totales }) => {
      if (inscritos.length === totales.length && totales.length > 0) {
        this.actividades.forEach((act) => {
          this.elegirCapitan(act.idActividad, idEvento);
        });
      }
    });
  }
}
