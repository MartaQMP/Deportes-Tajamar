import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EquiposService } from '../../services/equipos.service';
import Curso from '../../models/curso';
import Color from '../../models/color';
import Alumno from '../../models/alumno';
import usuarioLogeado from '../../models/usuarioLogeado';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import Equipo from '../../models/equipo';
import Swal from 'sweetalert2';
import Evento from '../../models/evento';
import { EventosService } from '../../services/eventos.service';
import { ResultadosService } from '../../services/resultados.service';
import { CommonModule, DatePipe } from '@angular/common';
import { AlumnosEquipoPipe } from '../../pipes/alumnos-equipo-pipe';

@Component({
  selector: 'app-equipos',
  imports: [FormsModule, DatePipe, AlumnosEquipoPipe, CommonModule],
  templateUrl: './equipos.html',
  styleUrl: './equipos.css',
})
export class Equipos implements OnInit {
  // Array para el select superior
  public inscripciones!: Array<any>;
  public idEventoSeleccionado: number | null = null;
  public equiposMostrados!: Array<Equipo>;
  public cargandoEquipos: boolean = false;
  public colores!: Array<Color>;

  constructor(
    private _serviceEquipos: EquiposService,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this._router.navigate(['/login']);
      return;
    }

    // 1. Cargamos las inscripciones del usuario
    this._serviceEquipos.getInscripcionesUsuario(token).subscribe((response) => {
      this.inscripciones = response;

      // Opcional: Seleccionar el primero por defecto
      if (this.inscripciones.length > 0) {
        this.idEventoSeleccionado = this.inscripciones[0].idEvento;
        this.cargarEquiposDelEvento(this.inscripciones[0].idEventoActividad);
      }
    });

    this._serviceEquipos.getColores().subscribe((response) => {
      this.colores = response;
    });
  }

  // Se dispara cuando el usuario cambia el Select
  onEventoChange() {
    // Buscamos en nuestro array de inscripciones el objeto que coincide con el idEvento seleccionado
    const inscripcionEncontrada = this.inscripciones.find(
      (ins) => ins.idEvento == this.idEventoSeleccionado,
    );

    if (inscripcionEncontrada) {
      this.cargarEquiposDelEvento(inscripcionEncontrada.idEventoActividad);
    }
  }

  cargarEquiposDelEvento(idEvAct: number) {
    this.cargandoEquipos = true;
    this._serviceEquipos.getEquipos().subscribe((response) => {
      this.equiposMostrados = response.filter(
        (equipo: Equipo) => equipo.idEventoActividad === idEvAct,
      );
      this.cargandoEquipos = false;
    });
  }

  apuntarme(idEquipo: number) {}

  getNombreColor(idColor: number): string {
    if (!this.colores) return 'Cargando...';
    const colorEncontrado = this.colores.find((c) => c.idColor == idColor);
    return colorEncontrado ? colorEncontrado.nombreColor : 'Sin color';
  }
}
