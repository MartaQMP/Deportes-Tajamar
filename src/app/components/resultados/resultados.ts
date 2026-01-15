import { Component, OnInit } from '@angular/core';
import { ResultadosService } from '../../services/resultados.service';
import Actividad from '../../models/actividad';
import Evento from '../../models/evento';
import Resultado from '../../models/resultado';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { NombreEquipoPipe } from '../../pipes/nombre-equipo-pipe';
import { AlumnosEquipoPipe } from '../../pipes/alumnos-equipo-pipe';
import ActividadesEvento from '../../models/actividadesevento';

@Component({
  selector: 'app-resultados',
  imports: [DatePipe, NombreEquipoPipe, CommonModule, AlumnosEquipoPipe],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css',
})
export class Resultados implements OnInit {
  public actividades!: Actividad[];
  public eventos!: Evento[];
  public resultadosAMostrar!: Resultado[];
  private tablaRelacion!: ActividadesEvento[];
  private todosLosResultados!: Resultado[];
  public idEventoSeleccionado: number = 0;
  public idActividadSeleccionada: number = 0;

  constructor(private _service: ResultadosService) {}

  ngOnInit(): void {
    this._service.getActividades().subscribe((response) => {
      this.actividades = response;
    });

    this._service.getEventos().subscribe((response) => {
      this.eventos = response;
    });

    this._service.getResultados().subscribe((response) => {
      this.resultadosAMostrar = response;
      this.todosLosResultados = response;
    });

    this._service.getEventoActividades().subscribe((response) => {
      this.tablaRelacion = response;
    });
  }

  filtrarPorActividad(event: any): void {
    this.idActividadSeleccionada = parseInt(event.target.value);
    this.idEventoSeleccionado = 0;
    this.aplicarFiltros('actividad');
  }

  filtrarPorEvento(event: any): void {
    this.idEventoSeleccionado = parseInt(event.target.value);
    this.idActividadSeleccionada = 0;
    this.aplicarFiltros('evento');
  }

  aplicarFiltros(tipo: 'evento' | 'actividad'): void {
    const idBusca = tipo === 'evento' ? this.idEventoSeleccionado : this.idActividadSeleccionada;

    if (!idBusca) {
      this.resultadosAMostrar = [...this.todosLosResultados];
      return;
    }

    this.resultadosAMostrar = this.todosLosResultados.filter((res) => {
      const relacion = this.tablaRelacion.find(
        (rel) => rel.idEventoActividad === res.idEventoActividad
      );
      if (!relacion) return false;

      return tipo === 'evento' ? relacion.idEvento === idBusca : relacion.idActividad === idBusca;
    });
  }
}
