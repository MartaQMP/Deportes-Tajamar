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

@Component({
  selector: 'app-equipos',
  imports: [FormsModule, DatePipe, AlumnosEquipoPipe, CommonModule],
  templateUrl: './equipos.html',
  styleUrl: './equipos.css',
})
export class Equipos implements OnInit {
  @ViewChild('nombreEquipo') nombreEquipo!: ElementRef;
  @ViewChild('colorSeleccionado') colorSeleccionado!: ElementRef;
  public token: string | null = null;
  public inscripciones!: Array<any>;
  public idEventoSeleccionado: number | null = null;
  public equiposMostrados!: Array<Equipo>;
  public cargandoEquipos: boolean = false;
  public colores!: Array<Color>;
  public estaInscrito!: boolean;
  public usuarioLogueado!: usuarioLogeado;
  public permisosUsuario: string | null = null;

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
    const tokenSeguro = this.token;
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
      }
    });

    this._serviceEquipos.getColores().subscribe((response) => {
      this.colores = response;
    });
  }

  cambioEvento() {
    // BUSCO LA INSCRIPCION DE ESE EVENTO
    const inscripcionEncontrada = this.inscripciones.find(
      (inscripcion) => inscripcion.idEvento == this.idEventoSeleccionado,
    );

    // CARGO LOS EQUIPOS DE ESE EVENTO Y ACTIVIDAD
    if (inscripcionEncontrada) {
      this.cargarEquiposDelEvento(inscripcionEncontrada.idEventoActividad);
    }
  }

  cargarEquiposDelEvento(idEventoActividad: number) {
    this.cargandoEquipos = true;
    this.estaInscrito = false;

    this._serviceEquipos.getEquipos().subscribe((response) => {
      // FILTRAMOS LOS EQUIPOS PARA QUE SE MUESTREN DEL EVENTO Y ACTIVIDAD SELECCIONADO
      this.equiposMostrados = response.filter(
        (equipo: Equipo) => equipo.idEventoActividad === idEventoActividad,
      );

      if (this.equiposMostrados.length === 0) {
        this.cargandoEquipos = false;
        return;
      }

      // MIRAMOS TODOS LOS MIEMBROS DE LOS EQUIPOS A LA VEZ
      const llamadasMiembros = this.equiposMostrados.map((eq) =>
        this._serviceResultados.getUsuariosDeEquipo(eq.idEquipo),
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
          });

          this.estaInscrito = true;
          // ESTO ES PARA 'FORZAR' LA RECARGA
          const equiposCopia = [...this.equiposMostrados];
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
          });
        },
      });
    }
  }

  getNombreColor(idColor: number): string {
    if (!this.colores) return 'Cargando...';
    const colorEncontrado = this.colores.find((c) => c.idColor == idColor);
    return colorEncontrado ? colorEncontrado.nombreColor : 'Sin color';
  }

  formularioCrearEquipo() {
    this.nombreEquipo.nativeElement.value = '';
    this.colorSeleccionado.nativeElement.value = '';

    Swal.fire({
      title: 'Crear Nuevo Equipo',
      html: `
      <div class="swal-form">
        <label class="form-label">Nombre del Equipo</label>
        <input class="form-control" placeholder="Ej: Los Cracks" name="nombreEquipo" #nombreEquipo>
        <br/>
        <label class="form-label">Selecciona el Color</label>
        <select class="form-select" name="colorSeleccionado" #colorSeleccionado>
          <option value="">Seleccione un color...</option>
          ${this.colores.map((color) => `<option value="${color.idColor}">${color.nombreColor}</option>`).join('')}
        </select>
      </div>
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Equipo',
      confirmButtonColor: '#f2212f',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombreEquipo: string = this.nombreEquipo.nativeElement.value;
        const color: number = this.colorSeleccionado.nativeElement.value;

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
    const inscripcionActual = this.inscripciones.find(
      (ins) => ins.idEvento == this.idEventoSeleccionado,
    );

    let minimoJugadores = inscripcionActual.minimoJugadores / 2;

    let equipo: Equipo = {
      idEquipo: 0,
      idEventoActividad: inscripcionActual.idEventoActividad,
      idColor: result.idColor,
      nombreEquipo: result.nombre,
      minimoJugadores: minimoJugadores,
      idCurso: this.usuarioLogueado.idCurso,
    };
    this._serviceEquipos.crearEquipo(equipo).subscribe();
  }
}
