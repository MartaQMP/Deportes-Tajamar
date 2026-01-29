import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView, CalendarModule } from 'angular-calendar';
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
import { OrganizadorService } from '../../services/organizador.service';
import CursosService from '../../services/cursos.service';
import Curso from '../../models/curso';

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
  public eventoSeleccionado: boolean = false;
  public usuarioActividades: UsuarioActividad[] = [];
  public actividadesGet: Actividad[] = [];
  public precioActividad: PrecioActividad[] = [];
  public precioTotalActividad!: PrecioActividad | undefined;
  public cargandoDatos!: boolean;
  public profesores: Map<number, string> = new Map();
  public usuarioCapitan!: Alumno;
  public token: any;
  public cursos: Curso[] = [];
  constructor(
    private _perfil: PerfilService,
    private _eventos: EventosService,
    private _actividades: ActividadesService,
    private _router: Router,
    private _inscripciones: InscripcionService,
    private _organizador: OrganizadorService,
    private _cursos: CursosService,
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
      console.log(this.usuario);
    });

    //Llamada al api eventos para recoger los eventos abiertos e incluirlos en el calendario

    this._eventos.buscarEventosAbiertos().subscribe({
      next: (response) => {
        this.eventos = response;
        this.ordenarEventos();

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

        this._eventos.getProfesor().subscribe({
          next: (response) => {
            console.log(response);
            response.forEach((r) => {
              this.profesores.set(r.idUsuario, r.usuario);
            });
            console.log(this.profesores);
          },
          error: (error) => {
            console.log('No entra profesores');
          },
        });
      },
      error: (err) => {
        console.error('Error cargando eventos', err);
      },
    });
  }

  ordenarEventos() {
    const fechaReferencia = new Date();
    fechaReferencia.setHours(0, 0, 0, 0);
    const hoy = fechaReferencia.getTime();

    const futuros = this.eventos
      .filter((e) => {
        const fechaE = new Date(e.fechaEvento);
        fechaE.setHours(0, 0, 0, 0);
        return fechaE.getTime() >= hoy;
      })
      .sort((a, b) => new Date(a.fechaEvento).getTime() - new Date(b.fechaEvento).getTime());

    const pasados = this.eventos
      .filter((e) => {
        const fechaE = new Date(e.fechaEvento);
        fechaE.setHours(0, 0, 0, 0);
        return fechaE.getTime() < hoy;
      })
      .sort((a, b) => new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime());

    this.eventos = [...futuros, ...pasados];
  }

  esPasado(idEvento: number): boolean {
    const evento = this.eventos.find((e) => e.idEvento === idEvento);

    if (!evento) {
      return false;
    }

    const fechaEvento = new Date(evento.fechaEvento);
    fechaEvento.setHours(0, 0, 0, 0);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return fechaEvento.getTime() < hoy.getTime();
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
        this._inscripciones.verInscripciones(e, a.idActividad).subscribe((response) => {
          this.personasInscritas[index] = response.length;
        });
        this.personasInscritas.reverse();
      });

      //ver si el usuario esta inscrito ya en alguna actividad de ese evento
      this.verInscripciones();
      this.verPrecioActividad();
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

  abrirModalActividad() {
    //Llamada al api para recoger los deportes disponibles

    this._actividades.getActividades().subscribe(
      (response) => {
        const disponibles = response.filter((apiAct: any) => {
          const yaExiste = this.actividades.some(
            (local) => local.idActividad === apiAct.idActividad,
          );
          return !yaExiste;
        });

        let actividadesHTML = '';

        if (disponibles.length > 0) {
          actividadesHTML = disponibles
            .map((a: any) => `<option value="${a.idActividad}">${a.nombre}</option>`)
            .join('');
        } else {
          actividadesHTML = `<option disabled>No quedan actividades disponibles</option>`;
        }

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
            title: 'swal-title-discreto',
          },
          preConfirm: () => {
            return {
              idActividad: (document.getElementById('swal-deporte') as HTMLSelectElement).value,
            };
          },
        }).then((result) => {
          if (result.isConfirmed) {
            console.log('Datos seleccionados:', result.value);
            this._eventos
              .crearActividad(this.idEventoSeleccionado, result.value.idActividad)
              .subscribe(
                (response) => {
                  this._actividades
                    .buscarActividadesPorEventos(this.idEventoSeleccionado.toString())
                    .subscribe((response) => {
                      this.actividades = response;
                      //Ver las inscripciones a esa actividad en ese evento
                      this.actividades.forEach((a, index) => {
                        this._inscripciones
                          .verInscripciones(this.idEventoSeleccionado, a.idActividad)
                          .subscribe((response) => {
                            this.personasInscritas[index] = response.length;
                          });
                        this.personasInscritas.reverse();
                      });

                      //ver si el usuario esta inscrito ya en alguna actividad de ese evento
                      this.verInscripciones();
                    });
                },
                (error) => {
                  Swal.fire('Error', 'No se inserto la actividad', 'error');
                },
              );
          }
        });
      },
      (error) => {
        console.error('Error al cargar actividades', error);
        Swal.fire('Error', 'No se pudieron cargar las actividades', 'error');
      },
    );
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
        title: 'swal-title-discreto',
      },
      preConfirm: () => {
        return {
          deporte: (document.getElementById('swal-deporte') as HTMLSelectElement).value,
          minimo: (document.getElementById('swal-deporte-minimo') as HTMLSelectElement).value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Datos seleccionados:', result.value);
        this._actividades.crearActividad(result.value.deporte, result.value.minimo).subscribe({
          next: (response) => {
            console.log(response);
          },
          error: (error) => {
            Swal.fire('Error', 'Error al insertar la actividad', 'error');
          },
        });
      }
    });
  }

  abrirModalFecha() {
    Swal.fire({
      title: 'Crear evento',
      text: 'Selecciona la fecha del evento:',
      input: 'date',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-popup-discreto',
        confirmButton: 'btn-confirm-discreto',
        cancelButton: 'btn-cancel-discreto',
        input: 'input-date-discreto',
        title: 'swal-title-discreto',
      },
    }).then((result) => {
      if (result.isConfirmed)
        this._eventos.crearEvento(result.value).subscribe({
          next: (response) => {
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
          },
        });
    });
  }

  asociarProfesorEvento(idEvento: number) {
    this._eventos.getProfesorSinEvento().subscribe((response) => {
      if (response.length > 0) {
        const randomIndex = Math.floor(Math.random() * response.length);
        this._eventos
          .postProfesorEvento(idEvento, response[randomIndex].idUsuario)
          .subscribe((response) => {
            console.log(response);
            this._eventos.buscarEventosAbiertos().subscribe((response) => {
              this.eventos = response;
              this.ordenarEventos();
            });
          });
      } else {
        const keys = Array.from(this.profesores.keys());

        if (keys.length > 0) {
          const randomIndex = Math.floor(Math.random() * keys.length);
          const randomKey = keys[randomIndex];
          this._eventos.postProfesorEvento(idEvento, randomKey).subscribe((response) => {
            console.log(response);
            this._eventos.buscarEventosAbiertos().subscribe((response) => {
              this.eventos = response;
              this.ordenarEventos();
            });
          });
        }
      }
    });
  }

  Inscribirse(e: ActividadEvento) {
    this._inscripciones
      .inscribirActividadEventoUsuario(this.usuario.idUsuario, e.idEventoActividad, this.capitan)
      .subscribe((response) => {
        console.log(response);
        this.verInscripciones();
        Swal.fire({
          title: 'Confirmada tu seleccion!',
          text: 'Se te ha apuntado a esta actividad.',
          icon: 'success',
        });
        this.actividades.forEach((a, index) => {
          this._inscripciones.verInscripciones(e.idEvento, a.idActividad).subscribe((response) => {
            this.personasInscritas[index] = response.length;
          });
          this.personasInscritas.reverse();
        });
      });
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
        title: 'swal-title-discreto',
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
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const precioFinal = result.value;
        console.log('Precio guardado:', precioFinal);
        const precioExistente = this.precioActividad?.find(
          (p) => p.idEventoActividad === a.idEventoActividad
        );

        if (precioExistente) {
          var precioModificado = this.precioActividad.find(
            (p) => p.idEventoActividad === a.idEventoActividad,
          );
          if (precioModificado)
            this._actividades
              .modificarPrecioActividad(
                precioModificado.idPrecioActividad,
                precioModificado.idEventoActividad,
                precioFinal,
              )
              .subscribe(
                (response) => {
                  this.verPrecioActividad();
                  Swal.fire({
                    title: 'Modificado!',
                    text: 'El precio se ha modificado.',
                    icon: 'success',
                  });
                },
                (error) => {
                  Swal.fire('Error', 'No se ha podido modificar el precio', 'error');
                },
              );
        } else
          this._actividades.insertarPrecioActividad(a.idEventoActividad, precioFinal).subscribe(
            (response) => {
              this.verPrecioActividad();
              Swal.fire({
                title: 'Insertado!',
                text: 'El precio se ha insertado.',
                icon: 'success',
              });
            },
            (error) => {
              Swal.fire('Error', 'No se ha podido insertar el precio', 'error');
            },
          );
      }
    });
  }

  verPrecioActividad() {
    this._actividades.getPrecioActividadPorEvento().subscribe((response) => {
      this.precioActividad = response
        .filter((precio: { idEventoActividad: number }) => {
          return this.actividades.some((act) => act.idEventoActividad === precio.idEventoActividad);
        })
        .map((precio: { idEventoActividad: number }) => {
          this.actividades.find((act) => act.idEventoActividad === precio.idEventoActividad);
          return {
            ...precio,
          };
        });
    });
  }

  obtenerPrecioActividad(idEventoActividad: number): PrecioActividad | undefined {
    const encontrado = this.precioActividad.find((p) => p.idEventoActividad === idEventoActividad);

    this.precioTotalActividad = encontrado;

    return encontrado;
  }

  eliminarActividadEvento(a: ActividadEvento) {
    Swal.fire({
      title: 'Estas seguro?',
      text: 'Si lo borras no hay vuelta atras!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, estoy seguro',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._actividades.deleteActividadEvento(a.idEventoActividad).subscribe({
          next: (response) => {
            console.log(response);
            this.MostrarActividades(a.idEvento);
            Swal.fire({
              title: 'Borrado!',
              text: 'La actividad ha sido borrada.',
              icon: 'success',
            });
          },
          error: (error) => {
            Swal.fire('Error', 'No se ha podido eliminar la actividad', 'error');
          },
        });
      }
    });
  }

  eliminarEvento() {
    Swal.fire({
      title: 'Estas seguro?',
      text: 'Si lo borras, no hay vuelta atras!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, estoy seguro!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._eventos.eliminarEvento(this.idEventoSeleccionado).subscribe({
          next: (response) => {
            console.log(response);
            this._eventos.buscarEventosAbiertos().subscribe((response) => {
              this.eventos = response;
              this.ordenarEventos();
              this.eventoSeleccionado = false;
              this.actividades = [];
            });
          },
          error: (error) => {
            Swal.fire('Error', 'No se ha podido eliminar el evento', 'error');
          },
        });
      }
    });
  }

  hacerSorteoCapitanesManual() {
    Swal.fire({
      title: '¿Realizar sorteo?',
      text: 'Se elegirá un capitán por cada curso en cada actividad de este evento.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Empezar',
      confirmButtonColor: '#f2212f',
    }).then((resPopup) => {
      if (resPopup.isConfirmed) {
        // 1. Primero cogemos la lista de inscripciones para saber quién quiere ser capitán
        this._inscripciones.getInscripciones().subscribe((todasLasInscripciones: any[]) => {
          // 2. Recorremos las actividades que hay ahora mismo en el evento
          this.actividades.forEach((actividad: any) => {
            // 3. Buscamos quiénes están apuntados a esa actividad
            this._inscripciones
              .verInscripciones(this.idEventoSeleccionado, actividad.idActividad)
              .subscribe((usuarios: any[]) => {
                // 4. Sacamos qué cursos distintos hay apuntados (ej: 1º DAW, 2º DAW...)
                const listaIdsCursos = [...new Set(usuarios.map((u: any) => u.idCurso))];

                // 5. Creamos los "montones" separando a los usuarios por su curso
                listaIdsCursos.forEach((idCurso: number) => {
                  const personasDelMonton = usuarios.filter((u: any) => u.idCurso === idCurso);

                  // Enviamos el montón al Método 2 para elegir al ganador
                  this.elegirCapitanYGuardar(
                    personasDelMonton,
                    todasLasInscripciones,
                    actividad.idEventoActividad,
                  );
                });
              });
          });
        });
      }
    });
  }
  elegirCapitanYGuardar(montonUsuarios: any[], listaReferencia: any[], idEvAct: number) {
    if (montonUsuarios.length === 0) return;

    // 1. Buscamos voluntarios: cruzamos el montón con la lista de referencia usando idUsuario e idEventoActividad
    const voluntarios = montonUsuarios.filter((usuario) => {
      const inscripcionReal = listaReferencia.find(
        (ins) => ins.idUsuario === usuario.idUsuario && ins.idEventoActividad === idEvAct,
      );
      return inscripcionReal ? inscripcionReal.quiereSerCapitan : false;
    });

    let elegido;

    // 2. Si hay voluntarios, sorteo entre ellos. Si no, sorteo entre todos.
    if (voluntarios.length > 0) {
      const indexAleatorio = Math.floor(Math.random() * voluntarios.length);
      elegido = voluntarios[indexAleatorio];
    } else {
      const indexAleatorio = Math.floor(Math.random() * montonUsuarios.length);
      elegido = montonUsuarios[indexAleatorio];
    }

    // 3. Preparamos el objeto para el POST (Estructura de Capitan)
    const nuevoCapitan = {
      idCapitanActividad: 0,
      idEventoActividad: idEvAct,
      idUsuario: elegido.idUsuario,
    };

    console.log('Capitan: ' + nuevoCapitan.idUsuario);

    this._inscripciones.crearCapitan(this.token, nuevoCapitan).subscribe({
      next: () => {
        Swal.fire({
          title: 'Capitan escogido',
          text: 'Capitan creado correctamente',
          icon: 'success',
          confirmButtonColor: '#f2212f',
        });
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'Error al crear el capitan',
          icon: 'error',
          confirmButtonColor: '#f2212f',
        });
      },
    });
  }
  asignarOrganizador() {
    this._cursos.getCursos().subscribe((response) => {
      this.cursos = response;

      const cursosHTML = this.cursos
        .map((c: any) => `<option value="${c.idCurso}">${c.nombre}</option>`)
        .join('');

      Swal.fire({
        title: 'Asignar Organizador',
        html: `
        <div style="text-align: left; margin-bottom: 5px; color: #555;">
          Selecciona el curso:
        </div>
        <select id="select-curso" class="input-date-discreto" style="margin-bottom: 15px; width: 100%;">
          <option value="" disabled selected>Selecciona un curso...</option>
          ${cursosHTML}
        </select>

        <div style="text-align: left; margin-bottom: 5px; color: #555;">
          Selecciona el organizador:
        </div>
        
        <select id="select-organizador" class="input-date-discreto" style="width: 100%;" disabled>
          <option value="" disabled selected>Primero elige un curso...</option>
        </select>
      `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
          popup: 'swal-popup-discreto',
          confirmButton: 'btn-confirm-discreto',
          cancelButton: 'btn-cancel-discreto',
          title: 'swal-title-discreto',
        },
        didOpen: () => {
          const popup = Swal.getPopup();
          const cursoSelect = popup?.querySelector('#select-curso') as HTMLSelectElement;
          const organizadorSelect = popup?.querySelector(
            '#select-organizador',
          ) as HTMLSelectElement;

          cursoSelect.addEventListener('change', () => {
            const idCursoSeleccionado = cursoSelect.value;

            organizadorSelect.innerHTML = '<option>Cargando datos...</option>';
            organizadorSelect.disabled = true;

            this._cursos.getAlumnosCurso(idCursoSeleccionado).subscribe(
              (data: Alumno[]) => {
                const options = data
                  .map((org) => `<option value="${org.idCursosUsuarios}">${org.usuario}</option>`)
                  .join('');

                organizadorSelect.innerHTML = `<option value="" disabled selected>Selecciona una opción...</option>${options}`;
                organizadorSelect.disabled = false;
              },
              (error) => {
                organizadorSelect.innerHTML = '<option>Error al cargar</option>';
              },
            );
          });
        },
        preConfirm: () => {
          // Validación final antes de cerrar
          const curso = (document.getElementById('select-curso') as HTMLSelectElement).value;
          const organizador = (document.getElementById('select-organizador') as HTMLSelectElement)
            .value;

          if (!curso || !organizador) {
            Swal.showValidationMessage('Debes seleccionar ambas opciones');
            return false;
          }

          return { idCurso: curso, idOrganizador: organizador };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('Datos seleccionados:', result.value);
          this._organizador.insertarOrganizador(result.value.idOrganizador).subscribe({
            next: (response) => {
              Swal.fire('Insertado', 'Se ha asignado rol Organizador', 'success');
            },
            error: (error) => {
              Swal.fire('Error', 'No se ha podido asignar el rol', 'error');
            },
          });
        }
      });
    });
  }

  eliminarOrganizador() {
    this._cursos.getCursos().subscribe((response) => {
      this.cursos = response;

      const cursosHTML = this.cursos
        .map((c: any) => `<option value="${c.idCurso}">${c.nombre}</option>`)
        .join('');

      Swal.fire({
        title: 'Eliminar Organizador',
        html: `
        <div style="text-align: left; margin-bottom: 5px; color: #555;">
          Selecciona el curso:
        </div>
        <select id="select-curso" class="input-date-discreto" style="margin-bottom: 15px; width: 100%;">
          <option value="" disabled selected>Selecciona un curso...</option>
          ${cursosHTML}
        </select>

        <div style="text-align: left; margin-bottom: 5px; color: #555;">
          Selecciona el organizador:
        </div>
        
        <select id="select-organizador" class="input-date-discreto" style="width: 100%;" disabled>
          <option value="" disabled selected>Primero elige un curso...</option>
        </select>
      `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
          popup: 'swal-popup-discreto',
          confirmButton: 'btn-confirm-discreto',
          cancelButton: 'btn-cancel-discreto',
          title: 'swal-title-discreto',
        },
        didOpen: () => {
          const popup = Swal.getPopup();
          const cursoSelect = popup?.querySelector('#select-curso') as HTMLSelectElement;
          const organizadorSelect = popup?.querySelector(
            '#select-organizador',
          ) as HTMLSelectElement;

          cursoSelect.addEventListener('change', () => {
            const idCursoSeleccionado = cursoSelect.value;

            organizadorSelect.innerHTML = '<option>Cargando datos...</option>';
            organizadorSelect.disabled = true;

            this._organizador.getOrganizador().subscribe(
              (data: Alumno[]) => {
                const usuariosFiltrados = data.filter(
                  (org) => org.idCurso == Number(idCursoSeleccionado),
                );

                if (usuariosFiltrados.length === 0) {
                  organizadorSelect.innerHTML =
                    '<option value="" disabled selected>No hay usuarios en este curso</option>';
                  organizadorSelect.disabled = true;
                  return;
                }

                const options = usuariosFiltrados
                  .map((org) => `<option value="${org.idUsuario}">${org.usuario}</option>`)
                  .join('');

                organizadorSelect.innerHTML = `<option value="" disabled selected>Selecciona una opción...</option>${options}`;
                organizadorSelect.disabled = false;
              },
              (error) => {
                organizadorSelect.innerHTML = '<option>Error al cargar</option>';
              },
            );
          });
        },
        preConfirm: () => {
          const curso = (document.getElementById('select-curso') as HTMLSelectElement).value;
          const organizador = (document.getElementById('select-organizador') as HTMLSelectElement)
            .value;

          if (!curso || !organizador) {
            Swal.showValidationMessage('Debes seleccionar ambas opciones');
            return false;
          }

          return { idCurso: curso, idOrganizador: organizador };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('Datos seleccionados:', result.value);
          this._organizador.deleteOrganizador(result.value.idOrganizador).subscribe({
            next: (response) => {
              Swal.fire('Eliminado', 'Se ha designado rol Organizador', 'success');
            },
            error: (error) => {
              Swal.fire('Error', 'No se ha podido designar el rol', 'error');
            },
          });
        }
      });
    });
  }
}
