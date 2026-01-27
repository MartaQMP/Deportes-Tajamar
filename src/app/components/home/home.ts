import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  CalendarEvent,
  CalendarView,
  CalendarModule
} from 'angular-calendar';
import { startOfDay, endOfDay } from 'date-fns';
import PerfilService from '../../services/perfil.service';
import { Router, RouterModule } from '@angular/router';
import usuarioLogeado from '../../models/usuarioLogeado';
import { EventosService } from '../../services/eventos.service';
import Evento from '../../models/evento';
import { Subject, forkJoin, map } from 'rxjs';
import ActividadEvento from '../../models/actividades';
import { ActividadesService } from '../../services/actividades.service';
import { InscripcionService } from '../../services/inscripcion.service';
import Inscripciones from '../../models/inscripciones';
import { FormsModule } from '@angular/forms';
import UsuarioActividad from '../../models/usuarioActividad';
import Swal from 'sweetalert2';
import Actividad from '../../models/actividad';
import PrecioActividad from '../../models/precioActividad';
import Profesores from '../../models/profesores';
import Alumno from '../../models/alumno';
import ActividadesEvento from '../../models/actividadesevento';
import Capitan from '../../models/capitan';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    RouterModule
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
  public actividades: ActividadEvento[] = [];
  public personasInscritas: number[] = [];
  public contador: number = 0;
  public capitan: boolean = false;
  public idEventoSeleccionado!: number;
  public eventoSeleccionado: boolean = false;
  public usuarioActividades: UsuarioActividad[] = [];
  public actividadesGet: Actividad[] = []
  public precioActividad: PrecioActividad[] = [];
  public precioTotalActividad!: PrecioActividad | undefined;
  public cargandoDatos!: boolean;
  public profesores: Map<number, string> = new Map();
  public usuarioCapitan!: Alumno;
  public token: any;
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
            title: 'Evento #' + eventoApi.idEvento,
            color: { primary: '#ad2121', secondary: '#FAE3E3' },
            meta: eventoApi
          };
        });

        this.events = nuevosEventos;

        this.refresh.next();

        this._eventos.getProfesor().subscribe({
          next: response => {
            console.log(response);
            response.forEach(r => {
              this.profesores.set(r.idUsuario, r.usuario);
            })
            console.log(this.profesores)
          }, error: (error) => {
            console.log("No entra profesores")
          }
        })

      },
      error: (err) => {
        console.error("Error cargando eventos", err);
      }

    });


  }




  verProfesorEvento(id: number): string {
    var p = this.profesores.get(id);
    return p ?? 'Profesor no encontrado';
  }

  //Llamada al api Actividades por evento para recoger las actividades disponibles por cada evento
  MostrarActividades(e: number) {
    console.log(e);
    this.eventoSeleccionado = true;
    this.idEventoSeleccionado = e;
    this._actividades.buscarActividadesPorEventos(e.toString()).subscribe((response) => {
      this.actividades = response;
      //Ver las inscripciones a esa actividad en ese evento
      this.actividades.forEach((a, index) => {
        this._inscripciones.verInscripciones(e, a.idActividad).subscribe(response => {
          this.personasInscritas[index] = response.length;
        })
        this.personasInscritas.reverse()
      })

      //ver si el usuario esta inscrito ya en alguna actividad de ese evento
      this.verInscripciones()
      this.verPrecioActividad()

    })
  }
  verInscripciones() {
    this._actividades.verUsuarioApuntado().subscribe(response => {
      this.usuarioActividades = response;
      console.log(this.usuarioActividades)
    })
  }

  yaEstaInscrito(idEvento: number): boolean {

    return this.usuarioActividades.some(actividad => actividad.idEvento === idEvento);
  }


  abrirModalActividad() {

    //Llamada al api para recoger los deportes disponibles

    this._actividades.getActividades().subscribe(response => {
      const actividadesHTML = response.map((a: { idActividad: any; nombre: any; }) =>
        `<option value="${a.idActividad}">${a.nombre}</option>`
      ).join('');

      Swal.fire({
        title: 'Añadir a Evento #' + this.idEventoSeleccionado,
        html: `
        <div style="text-align: left; margin-bottom: 5px; color: #555;">Deporte:</div>
        <select id="swal-deporte" class="input-date-discreto" style="margin: 0 !important;">
          <option value="" disabled selected>Selecciona una actividad...</option>
          ${actividadesHTML}
        </select>
        
      `,
        showCancelButton: true,
        confirmButtonText: 'Crear',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
          popup: 'swal-popup-discreto',
          confirmButton: 'btn-confirm-discreto',
          cancelButton: 'btn-cancel-discreto',
          title: 'swal-title-discreto'
        },
        preConfirm: () => {
          return {
            idActividad: (document.getElementById('swal-deporte') as HTMLSelectElement).value
          };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('Datos seleccionados:', result.value);
          this._eventos.crearActividad(this.idEventoSeleccionado, result.value.idActividad).subscribe(response => {
            this._actividades.buscarActividadesPorEventos(this.idEventoSeleccionado.toString()).subscribe((response) => {
              this.actividades = response;
              //Ver las inscripciones a esa actividad en ese evento
              this.actividades.forEach((a, index) => {
                this._inscripciones.verInscripciones(this.idEventoSeleccionado, a.idActividad).subscribe(response => {
                  this.personasInscritas[index] = response.length;
                })
                this.personasInscritas.reverse()
              })

              //ver si el usuario esta inscrito ya en alguna actividad de ese evento
              this.verInscripciones()

            })

          }, error => {
            Swal.fire('Error', 'No se inserto la actividad', 'error');
          });
        }
      });

    }, error => {
      console.error('Error al cargar actividades', error);
      Swal.fire('Error', 'No se pudieron cargar las actividades', 'error');
    });

  }



  abrirModalActividadCrear() {

    Swal.fire({
      title: 'Crear Actividad',
      html: `
        <div style="text-align: left; margin-bottom: 5px; color: #555;">
        <label>Nombre del deporte:</label>
        <input type="text" id="swal-deporte" class="form-control mx-auto my-4">
        <label>Jugadores minimos del deporte:</label>
        <input type="number" id="swal-deporte-minimo" class="form-control mx-auto my-4"></div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup-discreto',
        confirmButton: 'btn-confirm-discreto',
        cancelButton: 'btn-cancel-discreto',
        title: 'swal-title-discreto'
      },
      preConfirm: () => {
        return {
          deporte: (document.getElementById('swal-deporte') as HTMLSelectElement).value,
          minimo: (document.getElementById('swal-deporte-minimo') as HTMLSelectElement).value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Datos seleccionados:', result.value);
        this._actividades.crearActividad(result.value.deporte, result.value.minimo).subscribe({
          next: response => {
            console.log(response);
          },
          error: (error) => {
            Swal.fire('Error', 'Error al insertar la actividad', 'error');
          }
        })
      }
    })

  }




  abrirModalFecha() {
    Swal.fire({
      title: 'Crear evento',
      text: 'Selecciona la fecha del evento:',
      input: 'date',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-popup-discreto',
        confirmButton: 'btn-confirm-discreto',
        cancelButton: 'btn-cancel-discreto',
        input: 'input-date-discreto',
        title: 'swal-title-discreto'
      }
    }).then((result) => {

      if (result.isConfirmed)
        this._eventos.crearEvento(result.value).subscribe({
          next: response => {
            const fechaSeleccionada = result.value;
            if (fechaSeleccionada) {
              console.log('Fecha seleccionada:', fechaSeleccionada);
              console.log(response);
              this.asociarProfesorEvento(response.idEvento);
              Swal.fire('¡Listo!', `Evento creado para el ${fechaSeleccionada}`, 'success');
            }
          },
          error: (error) => {
            Swal.fire('Error', 'Debes seleccionar una fecha', 'error');
          }
        })

    });
  }

  asociarProfesorEvento(idEvento: number) {
    this._eventos.getProfesorSinEvento().subscribe((response) => {
      if (response.length > 0) {
        const randomIndex = Math.floor(Math.random() * response.length);
        this._eventos.postProfesorEvento(idEvento, response[randomIndex].idUsuario).subscribe(response => {
          console.log(response);
           this._eventos.buscarEventosAbiertos().subscribe(
            (response) => {
                this.eventos = response;
            })
        })
      } else {
        const keys = Array.from(this.profesores.keys());

        if (keys.length > 0) {
          const randomIndex = Math.floor(Math.random() * keys.length);
          const randomKey = keys[randomIndex];
          this._eventos.postProfesorEvento(idEvento, randomKey)
          .subscribe(response => {
                    console.log(response);
                     this._eventos.buscarEventosAbiertos().subscribe(
                    (response) => {
                        this.eventos = response;
                    })
          })
        }
      }
     
  })
  }

  Inscribirse(e: ActividadEvento) {
    this._inscripciones.inscribirActividadEventoUsuario(this.usuario.idUsuario, e.idEventoActividad, this.capitan).subscribe(
      (response => {
        console.log(response);
        this.verInscripciones();
        this.actividades.forEach((a, index) => {
          this._inscripciones.verInscripciones(e.idEvento, a.idActividad).subscribe(response => {
            this.personasInscritas[index] = response.length;
          })
          this.personasInscritas.reverse()
        })
      })
    )
  }



  anadirPrecio(a: ActividadEvento) {
    Swal.fire({
      title: 'Añadir Precio',
      html: `
        <div style="text-align: left; margin-bottom: 5px; color: #555;">
          Indica el coste de la actividad:
        </div>
        
        <input 
          id="swal-input-precio" 
          type="number" 
          class="input-date-discreto"
          placeholder="0.00" 
          min="0" 
          step="0.01" 
          style="margin: 0 !important; width: 100%; box-sizing: border-box;"
        >
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Precio',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        popup: 'swal-popup-discreto',
        confirmButton: 'btn-confirm-discreto',
        cancelButton: 'btn-cancel-discreto',
        title: 'swal-title-discreto'
      },
      didOpen: () => {
        // Opcional: Pone el foco en el input automáticamente al abrir
        const input = Swal.getPopup()?.querySelector('#swal-input-precio') as HTMLInputElement;
        if (input) input.focus();
      },
      preConfirm: () => {
        const precioInput = document.getElementById('swal-input-precio') as HTMLInputElement;
        const precioValor = precioInput.value;

        if (!precioValor) {
          Swal.showValidationMessage('Por favor, escribe un precio válido');
          return false;
        }
        return parseFloat(precioValor);
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const precioFinal = result.value;
        console.log('Precio guardado:', precioFinal);

        this._actividades.insertarPrecioActividad(a.idEventoActividad, precioFinal).subscribe(response => {
          console.log(response);
          this.verPrecioActividad();
        }, error => {
          Swal.fire('Error', 'No se ha podido insertar el precio', 'error');
        })
      }
    });
  }

  verPrecioActividad() {
    this._actividades.getPrecioActividadPorEvento().subscribe(response => {
      this.precioActividad = response
        .filter((precio: { idEventoActividad: number; }) => {
          return this.actividades.some(act => act.idEventoActividad === precio.idEventoActividad);
        }).map((precio: { idEventoActividad: number; }) => {
          this.actividades.find(
            act => act.idEventoActividad === precio.idEventoActividad
          );
          return {
            ...precio,
          };
        });

    });
  }

  obtenerPrecioActividad(idEventoActividad: number): PrecioActividad | undefined {

    const encontrado = this.precioActividad.find(p => p.idEventoActividad === idEventoActividad);

    // Asignamos directamente. Si es undefined, se asigna undefined.
    // No hace falta poner '|| undefined'
    this.precioTotalActividad = encontrado;

    return encontrado;
  }
  eliminarActividadEventoPrecio(a: ActividadEvento) {
    var p = this.obtenerPrecioActividad(a.idEventoActividad);
    if (p != undefined)
      this._actividades.deleteActividadEventoPrecio(p.idPrecioActividad).subscribe(response => {
        console.log(response);
        this.eliminarActividadEvento(a);
      })
  }


  eliminarActividadEvento(a: ActividadEvento) {
    this._actividades.deleteActividadEvento(a.idEventoActividad).subscribe(response => {
      console.log(response);
      this.MostrarActividades(a.idEvento);
    })
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
                console.log('Usuario: ' + this.usuarioCapitan.usuario);
                console.log('EventoActividad: ' + eventoActividad.idEventoActividad);
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
