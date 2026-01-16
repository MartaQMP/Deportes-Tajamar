import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import Resultados from '../models/resultado';
import Alumno from '../models/alumno';
import Actividad from '../models/actividad';
import Evento from '../models/evento';
import Equipo from '../models/equipo';

@Injectable({
  providedIn: 'root',
})
export class ResultadosService {
  constructor(private _http: HttpClient) {}

  getResultados(): Observable<Resultados[]> {
    let request = 'api/partidoresultado';
    return this._http.get<Resultados[]>(environment.url + request);
  }

  getUsuariosDeEquipo(idEquipo: number): Observable<Alumno[]> {
    let request = 'api/equipos/usuariosequipo/' + idEquipo;
    return this._http.get<Alumno[]>(environment.url + request);
  }

  getActividades(): Observable<Actividad[]> {
    let request = 'api/actividades';
    return this._http.get<Actividad[]>(environment.url + request);
  }

  getEventos(): Observable<Evento[]> {
    let request = 'api/eventos';
    return this._http.get<Evento[]>(environment.url + request);
  }

  buscarEquipoPorId(idEquipo: number): Observable<Equipo> {
    let request = 'api/equipos/' + idEquipo;
    return this._http.get<Equipo>(environment.url + request);
  }

  getEventoActividades(): Observable<any> {
    let request = "api/actividadesevento";
    return this._http.get(environment.url + request);
  }

  
}
