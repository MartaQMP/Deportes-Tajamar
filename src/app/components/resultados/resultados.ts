import { Component, OnInit } from '@angular/core';
import { ResultadosService } from '../../services/resultados.service';
import Actividad from '../../models/actividad';
import Evento from '../../models/evento';
import Resultado from '../../models/resultado';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { NombreEquipoPipe } from '../../pipes/nombre-equipo-pipe';
import { AlumnosEquipoPipe } from '../../pipes/alumnos-equipo-pipe';

@Component({
  selector: 'app-resultados',
  imports: [DatePipe, NombreEquipoPipe, CommonModule, AlumnosEquipoPipe],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css',
})
export class Resultados implements OnInit {
  public actividades!: Actividad[];
  public eventos!: Evento[];
  public resultados!: Resultado[];

  constructor(private _service: ResultadosService) {}

  ngOnInit(): void {
    this._service.getActividades().subscribe((response) => {
      this.actividades = response;
    });

    this._service.getEventos().subscribe((response) => {
      this.eventos = response;
    });

    this._service.getResultados().subscribe((response) => {
      this.resultados = response;
    });
  }
}
