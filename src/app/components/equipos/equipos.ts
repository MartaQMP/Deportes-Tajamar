import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EquiposService } from '../../services/equipos.service';
import Color from '../../models/color';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Equipo from '../../models/equipo';
import { CommonModule, DatePipe } from '@angular/common';
import { AlumnosEquipoPipe } from '../../pipes/alumnos-equipo-pipe';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { ResultadosService } from '../../services/resultados.service';
import usuarioLogeado from '../../models/usuarioLogeado';
import { Title } from '@angular/platform-browser';
import Actividad from '../../models/actividad';

@Component({
  selector: 'app-equipos',
  imports: [FormsModule, DatePipe, AlumnosEquipoPipe, CommonModule],
  templateUrl: './equipos.html',
  styleUrl: './equipos.css',
})
export class Equipos implements OnInit {
  @ViewChild('formNuevoEquipo') formNuevoEquipo!: ElementRef;
  @ViewChild('guardarFormulario') guardarFormulario!: ElementRef;
  @ViewChild('nombreEquipo') nombreEquipo!: ElementRef;
  @ViewChild('colorSeleccionado') colorSeleccionado!: ElementRef;
  public token: string | null = null;
  public inscripciones!: Array<any>;
  public idEventoSeleccionado: number | null = null;
  public actividad!: Actividad;
  public equiposMostrados!: Array<Equipo>;
  public cargandoEquipos: boolean = false;
  public colores!: Array<Color>;
  public coloresActivos!: Array<Color>;
  public estaInscrito!: boolean;
  public usuarioLogueado!: usuarioLogeado;
  public permisosUsuario: string | null = null;
  public esCapitanEnEvento: boolean = false;

  constructor(
    private _serviceEquipos: EquiposService,
    private _router: Router,
    private _serviceResultados: ResultadosService,
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    this.permisosUsuario = localStorage.getItem('permisosUsuario');

    if (!this.token) {
      this._router.navigate(['/login']);
      return;
    }
    let tokenSeguro = this.token;
    // USUARIO LOGUEADO
    this._serviceEquipos.getDatosUsuario(tokenSeguro).subscribe((responseUsuario) => {
      this.usuarioLogueado = responseUsuario;
    });

    // MIRO LAS INSCRIPCIONES DEL USUARIO EN LOS EVENTOS
    this._serviceEquipos.getInscripcionesUsuario(tokenSeguro).subscribe((responseInscripciones) => {
      this.inscripciones = responseInscripciones;

      // SI HAY INSCRIPCIONES SE CARGA LA PRIMERA POR DEFECTO
      if (this.inscripciones.length > 0) {
        this.idEventoSeleccionado = this.inscripciones[0].idEvento;
        this.cargarEquiposDelEvento(this.inscripciones[0].idEventoActividad);
        this.esCapitanEnEventoSeleccionado(this.inscripciones[0].idEventoActividad);
      }
    });

    this._serviceEquipos.getColores().subscribe((response) => {
      this.colores = response;
      this.actualizarColoresDisponibles();
    });
  }

  esCapitanEnEventoSeleccionado(idEventoActividad: number) {
    this._serviceEquipos
      .getUsuarioCapitanEventoActividad(idEventoActividad)
      .subscribe((response) => {
        // COMPRUEBO SI EL USUARIO TRAIDO ES IGUAL AL LOGUEADO
        if (response && response.idUsuario === this.usuarioLogueado.idUsuario) {
          this.esCapitanEnEvento = true;
        } else {
          this.esCapitanEnEvento = false;
        }
      });
  }

  cambioEvento() {
    // BUSCO LA INSCRIPCION DE ESE EVENTO
    let inscripcionEncontrada = this.inscripciones.find(
      (inscripcion) => inscripcion.idEvento == this.idEventoSeleccionado,
    );

    // CARGO LOS EQUIPOS DE ESE EVENTO Y ACTIVIDAD
    if (inscripcionEncontrada) {
      this.esCapitanEnEventoSeleccionado(inscripcionEncontrada.idEventoActividad);
      this.cargarEquiposDelEvento(inscripcionEncontrada.idEventoActividad);
    }
  }

  cargarEquiposDelEvento(idEventoActividad: number) {
    this.cargandoEquipos = true;

    this._serviceEquipos.getEquipos().subscribe((response) => {
      // FILTRAMOS LOS EQUIPOS PARA QUE SE MUESTREN DEL EVENTO Y ACTIVIDAD SELECCIONADO
      this.equiposMostrados = response.filter(
        (equipo: Equipo) => equipo.idEventoActividad === idEventoActividad,
      );

      this.actualizarColoresDisponibles();

      if (this.equiposMostrados.length === 0) {
        this.cargandoEquipos = false;
        return;
      }

      // MIRAMOS TODOS LOS MIEMBROS DE LOS EQUIPOS A LA VEZ
      let llamadasMiembros = this.equiposMostrados.map((equipo) =>
        this._serviceResultados.getUsuariosDeEquipo(equipo.idEquipo),
      );

      forkJoin(llamadasMiembros).subscribe((listasMiembros) => {
        // MIRAMOS SI ESTA EN ALGUN EQUIPO
        this.estaInscrito = listasMiembros.some((lista) =>
          lista.some((miembro) => miembro.idUsuario === this.usuarioLogueado.idUsuario),
        );

        this.cargandoEquipos = false;
      });
    });
  }

  apuntarme(idEquipo: number, idEventoActividad: number) {
    if (this.token) {
      this._serviceEquipos.aniadirMiembroEquipo(this.token, idEquipo).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Te has unido!',
            text: 'Ya formas parte del equipo correctamente.',
            icon: 'success',
            confirmButtonColor: '#f2212f',
          });

          this.estaInscrito = true;
          // ESTO ES PARA 'FORZAR' LA RECARGA
          let equiposCopia = [...this.equiposMostrados];
          this.equiposMostrados = [];

          setTimeout(() => {
            this.equiposMostrados = equiposCopia;
            this.cargarEquiposDelEvento(idEventoActividad);
          }, 50);
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: 'No se ha podido completar la inscripción. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonColor: '#f2212f',
          });
        },
      });
    }
  }

  getNombreColor(idColor: number): string {
    if (!this.colores) return 'Cargando...';
    let colorEncontrado = this.colores.find((c) => c.idColor == idColor);
    return colorEncontrado ? colorEncontrado.nombreColor : 'Sin color';
  }

  actualizarColoresDisponibles() {
    if (this.colores && this.equiposMostrados) {
      // COJO LOS IdColor QUE YA HAY EN LOS EQUIPOS
      const idsOcupados = this.equiposMostrados.map((e) => e.idColor);

      // FILTRO LA LISTA DE COLORES PARA GUARDAR SOLO LOS QUE NO ESTAN USADOS
      this.coloresActivos = this.colores.filter((c) => !idsOcupados.includes(c.idColor));
    } else {
      // SI NO HAY DATOS SE GUARDAN TODOS
      this.coloresActivos = this.colores;
    }
  }

  formularioCrearEquipo() {
    // ME MUESTRA EL FORMULARIO PARA CREAR UN EQUIPO
    this.nombreEquipo.nativeElement.value = '';
    this.colorSeleccionado.nativeElement.value = '';

    Swal.fire({
      title: 'Crear Nuevo Equipo',
      html: this.formNuevoEquipo.nativeElement,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Equipo',
      confirmButtonColor: '#f2212f',
      cancelButtonText: 'Cancelar',
      didClose: () => {
        if (this.guardarFormulario && this.formNuevoEquipo) {
          this.guardarFormulario.nativeElement.appendChild(this.formNuevoEquipo.nativeElement);
        }
      },
      preConfirm: () => {
        let nombreEquipo: string = this.nombreEquipo.nativeElement.value;
        let color: number = this.colorSeleccionado.nativeElement.value;

        if (!nombreEquipo || !color) {
          Swal.showValidationMessage('Por favor, rellena todos los campos');
          return false;
        }

        return { nombre: nombreEquipo, idColor: color };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.crearEquipo(result.value);
      }
    });
  }

  crearEquipo(result: { nombre: string; idColor: number }) {
    let tokenSeguro = this.token;
    if (tokenSeguro) {
      let inscripcionActual = this.inscripciones.find(
        (ins) => ins.idEvento == this.idEventoSeleccionado,
      );

      this._serviceEquipos
        .getActividadPorId(inscripcionActual.idActividad)
        .subscribe((response) => {
          this.actividad = response;
          let minimoJugadores: number = Math.floor(this.actividad.minimoJugadores / 2);

          let equipo: Equipo = {
            idEquipo: 1,
            idEventoActividad: inscripcionActual.idEventoActividad,
            nombreEquipo: result.nombre,
            minimoJugadores: minimoJugadores,
            idColor: Number(result.idColor),
            idCurso: this.usuarioLogueado.idCurso,
          };

          this._serviceEquipos.crearEquipo(tokenSeguro, equipo).subscribe({
            next: () => {
              Swal.fire({
                title: 'Creado',
                text: 'El equipo se ha creado correctamente.',
                icon: 'success',
                confirmButtonColor: '#f2212f',
              });

              // PARA RECARGAR LOS EQUIPOS
              if (inscripcionActual) {
                const equiposCopia = [...this.equiposMostrados];
                this.equiposMostrados = [];

                setTimeout(() => {
                  this.equiposMostrados = equiposCopia;
                  this.cargarEquiposDelEvento(inscripcionActual.idEventoActividad);
                }, 50);
              }
            },
          });
        });
    }
  }

  eliminarEquipo(idEquipo: number) {
    let tokenSeguro = this.token;
    if (tokenSeguro) {
      // GUARDAMOS LA INSCRIPCION ACTUAL PARA LUEGO HACER LA RECARGA
      const inscripcionActual = this.inscripciones.find(
        (ins) => ins.idEvento == this.idEventoSeleccionado,
      );

      // MIRO SI EL EQUIPO TIENE MIEMBROS
      this._serviceResultados.getUsuariosDeEquipo(idEquipo).subscribe((response) => {
        if (response && response.length > 0) {
          // SI LOS TIENE MANDA ALERTA
          Swal.fire({
            title: 'No se puede eliminar',
            text: 'Primero tienes que quitar a los miembros del equipo.',
            icon: 'warning',
            confirmButtonColor: '#f2212f',
          });
        } else {
          Swal.fire({
            title: '¿Estas seguro?',
            text: 'No podrás revertirlo',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f2212f',
            cancelButtonColor: '#272626',
            confirmButtonText: 'Si, eliminalo',
          }).then((result) => {
            if (result.isConfirmed) {
              this._serviceEquipos.deleteEquipo(tokenSeguro, idEquipo).subscribe({
                next: () => {
                  Swal.fire({
                    title: 'Eliminado',
                    text: 'El equipo se ha eliminado correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#f2212f',
                  });

                  // SE HACE LA RECARGA DE EQUIPOS
                  if (inscripcionActual) {
                    this.cargarEquiposDelEvento(inscripcionActual.idEventoActividad);
                  }
                },
                error: (err) => {
                  Swal.fire({
                    title: 'Error',
                    text: 'No se ha podido eliminar el equipo.',
                    icon: 'error',
                    confirmButtonColor: '#f2212f',
                  });
                },
              });
            }
          });
        }
      });
    }
  }

  eliminarMiembroEquipo(idMiembroEquipo: number) {
    let tokenSeguro = this.token;
    if (tokenSeguro) {
      Swal.fire({
        title: '¿Estas seguro?',
        text: 'No podrás revertirlo',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f2212f',
        cancelButtonColor: '#272626',
        confirmButtonText: 'Si, eliminalo',
      }).then((result) => {
        if (result.isConfirmed) {
          this._serviceEquipos.deleteMiembroEquipo(tokenSeguro, idMiembroEquipo).subscribe({
            next: () => {
              Swal.fire({
                title: 'Eliminado',
                text: 'El usuario se ha eliminado correctamente del equipo.',
                icon: 'success',
                confirmButtonColor: '#f2212f',
              });

              const inscripcionActual = this.inscripciones.find(
                (ins) => ins.idEvento == this.idEventoSeleccionado,
              );

              // PARA RECARGAR LOS EQUIPOS
              if (inscripcionActual) {
                const equiposCopia = [...this.equiposMostrados];
                this.equiposMostrados = [];

                setTimeout(() => {
                  this.equiposMostrados = equiposCopia;
                  this.cargarEquiposDelEvento(inscripcionActual.idEventoActividad);
                }, 50);
              }
            },
            error: () => {
              Swal.fire({
                title: 'Error',
                text: 'No se ha podido eliminar el usuario del equipo.',
                icon: 'error',
                confirmButtonColor: '#f2212f',
              });
            },
          });
        }
      });
    }
  }
}
