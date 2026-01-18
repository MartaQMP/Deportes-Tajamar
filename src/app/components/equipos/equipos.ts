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

@Component({
  selector: 'app-equipos',
  imports: [FormsModule],
  templateUrl: './equipos.html',
  styleUrl: './equipos.css',
})
export class Equipos implements OnInit {
  @ViewChild('nombreEquipo') nombreEquipo!: ElementRef;
  @ViewChild('colorElegido') colorElegido!: ElementRef;
  @ViewChild('jugadoresMinimos') jugadoresMinimos!: ElementRef;
  public cursos!: Array<Curso>;
  public colores!: Array<Color>;
  public usuarios!: Array<Alumno>;
  public usuarioLogueado!: usuarioLogeado;
  public isUsuarioLogueado: boolean = false;
  public idEvento: number = 1;
  public idActividad: number = 1;
  public miembrosEquipo: Array<Alumno> = [];

  constructor(private _service: EquiposService, private _router: Router) {}

  ngOnInit(): void {
    if (localStorage.getItem('token') == null) {
      this._router.navigate(['/login']);
    } else {
      const token = localStorage.getItem('token');

      if (token != null) {
        this._service.getDatosUsuario(token).subscribe((response) => {
          this.isUsuarioLogueado = true;
          this.usuarioLogueado = response;
        });

        this._service.getColores().subscribe((response) => {
          this.colores = response;
        });

        this._service.getCursos().subscribe((response) => {
          this.cursos = response;
        });

        /* AVERIGUAR idEvento E idActividad DEL CAPITAN */ this._service
          .getAlumnosPorActividadEvento(this.idEvento, this.idActividad)
          .subscribe((response) => {
            this.usuarios = response;
          });
      }
    }
  }
  getUsuariosPorCurso(idCurso: number) {
    if (!this.usuarios) {
      return [];
    }

    return this.usuarios.filter((user) => user.idCurso === idCurso);
  }

  agregarMiembro(alumno: Alumno, nombreCurso: string) {
    const existe = this.miembrosEquipo.find((m) => m.idUsuario === alumno.idUsuario);

    if (!existe) {
      const nuevoMiembro = { ...alumno, nombreCursoExhibicion: nombreCurso };
      this.miembrosEquipo.push(nuevoMiembro);
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Este alumno ya forma parte del equipo',
        icon: 'error',
      });
    }
  }

  expulsarMiembro(index: number) {
    this.miembrosEquipo.splice(index, 1);
  }

  guardarEquipo() {
    if (!this.nombreEquipo.nativeElement.value || !this.colorElegido.nativeElement.value) {
      Swal.fire({
        title: 'Error',
        text: 'El nombre y el color no pueden estar vacios',
        icon: 'error',
      });
      return;
    }

    if (this.miembrosEquipo.length < 1) {
      Swal.fire({
        title: 'Error',
        text: 'El equipo debe tener al menos un miembro.',
        icon: 'error',
      });
      return;
    }

    const nuevoEquipo: Equipo = {
      idEquipo: 0,
      idEventoActividad: 0,
      nombreEquipo: this.nombreEquipo.nativeElement.value,
      minimoJugadores: this.jugadoresMinimos.nativeElement.value,
      idColor: this.colorElegido.nativeElement.value,
      idCurso: this.usuarioLogueado.idCurso,
    };

    this._service.crearEquipo(nuevoEquipo).subscribe((equipoCreado) => {
      const idNuevoEquipo = equipoCreado.idEquipo;
      console.log('Equipo creado con ID:', idNuevoEquipo);

      const peticionesMiembros = this.miembrosEquipo.map((miembro) => {
        return this._service.aniadirMiembroEquipo(idNuevoEquipo, miembro.idUsuario);
      });

      forkJoin(peticionesMiembros).subscribe({
        next: (respuestas) => {
          alert('¡Equipo y miembros guardados con éxito!');
        },
      });
    });
  }
}
