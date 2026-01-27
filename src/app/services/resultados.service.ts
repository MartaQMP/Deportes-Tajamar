import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import Resultados from '../models/resultado';
import Alumno from '../models/alumno';
import Actividad from '../models/actividad';
import Evento from '../models/evento';
import Equipo from '../models/equipo';
import ActividadesEvento from '../models/actividadesevento';

@Injectable({
  providedIn: 'root',
})
export class ResultadosService {
  constructor(private _http: HttpClient) {}

  getResultados(): Observable<Array<Resultados>> {
    let request = 'api/partidoresultado';
    return this._http.get<Resultados[]>(environment.url + request);
  }

  getUsuariosDeEquipo(idEquipo: number): Observable<Array<Alumno>> {
    let request = 'api/equipos/usuariosequipo/' + idEquipo;
    return this._http.get<Alumno[]>(environment.url + request);
  }

  getActividades(): Observable<Array<Actividad>> {
    let request = 'api/actividades';
    return this._http.get<Actividad[]>(environment.url + request);
  }

  getEventos(): Observable<Array<Evento>> {
    let request = 'api/eventos';
    return this._http.get<Evento[]>(environment.url + request);
  }

  buscarEquipoPorId(idEquipo: number): Observable<Equipo> {
    let request = 'api/equipos/' + idEquipo;
    return this._http.get<Equipo>(environment.url + request);
  }

  getEventoActividades(): Observable<Array<ActividadesEvento>> {
    let request = 'api/actividadesevento';
    return this._http.get<Array<ActividadesEvento>>(environment.url + request);
  }
}
