import { Component, OnInit, resolveForwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Curso from '../../models/curso';
import CursosService from '../../services/cursos.service';
import Alumno from '../../models/alumno';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cursos',
  imports: [CommonModule],
  templateUrl: './cursos.html',
  styleUrl: './cursos.css',
  providers: [CursosService]
})
export class Cursos implements OnInit {

  public cursos: Array<Curso>;
  public alumnosCurso: Array<Alumno>;
  public cursoExpandido: number | null = null;
  public cargandoAlumnos: boolean = false;

  constructor(private _service: CursosService) {
    this.cursos = [];
    this.alumnosCurso = [];
  }

  ngOnInit(): void {
    this._service.getCursos().subscribe((response) => {
      this.cursos = response;
    })
  }

  verAlumnos(idCurso: number): void {
    // Si el curso ya está expandido, lo cerramos
    if (this.cursoExpandido === idCurso) {
      this.cursoExpandido = null;
      this.alumnosCurso = [];
      return;
    }

    // Expandir nuevo curso y cargar alumnos
    this.cursoExpandido = idCurso;
    this.cargandoAlumnos = true;
    this.alumnosCurso = [];

    this._service.getAlumnosCurso(idCurso.toString()).subscribe({
      next: (response) => {
        this.alumnosCurso = response;
        this.cargandoAlumnos = false;
      },
      error: (err) => {
        console.error('Error al cargar alumnos:', err);
        this.cargandoAlumnos = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los alumnos del curso'
        });
      }
    });
  }

}
