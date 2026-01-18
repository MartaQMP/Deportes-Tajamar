import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule, DatePipe, NombreEquipoPipe, CommonModule, AlumnosEquipoPipe],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css',
})
export class Resultados implements OnInit {
  public actividades!: Array<Actividad>;
  public eventos!: Array<Evento>;
  public resultadosAMostrar!: Array<Resultado>;
  private tablaRelacion!: Array<ActividadesEvento>;
  private todosLosResultados!: Array<Resultado>;
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

  filtrarPorEvento(event: any): void {
    this.idEventoSeleccionado = parseInt(event.target.value);
    this.idActividadSeleccionada = 0;
    this.aplicarFiltros('evento');
  }

  filtrarPorActividad(event: any): void {
    this.idActividadSeleccionada = parseInt(event.target.value);
    this.idEventoSeleccionado = 0;
    this.aplicarFiltros('actividad');
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

  limpiarFiltros(): void {
    this.idEventoSeleccionado = 0;
    this.idActividadSeleccionada = 0;
    this.resultadosAMostrar = [...this.todosLosResultados];
  }
}
