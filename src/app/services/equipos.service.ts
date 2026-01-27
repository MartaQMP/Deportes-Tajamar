import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Color from '../models/color';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import Curso from '../models/curso';
import Alumno from '../models/alumno';
import usuarioLogeado from '../models/usuarioLogeado';
import Capitan from '../models/capitan';
import { he } from 'date-fns/locale';
import Equipo from '../models/equipo';
import Actividad from '../models/actividad';

@Injectable({
  providedIn: 'root',
})
export class EquiposService {
  constructor(private _http: HttpClient) {}

  getColores(): Observable<Array<Color>> {
    let request = 'api/colores';
    return this._http.get<Array<Color>>(environment.url + request);
  }

  getActividadPorId(idActividad: number): Observable<Actividad> {
    let request = 'api/actividades/' + idActividad;
    return this._http.get<Actividad>(environment.url + request);
  }

  crearEquipo(token: string, equipo: Equipo): Observable<any> {
    let request = 'api/equipos/create';
    let dataJson = JSON.stringify(equipo);
    let header = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);
    return this._http.post(environment.url + request, dataJson, { headers: header });
  }

  aniadirMiembroEquipo(token: string, idEquipo: number): Observable<any> {
    let request = 'api/usuariosdeportes/apuntarmeequipo/' + idEquipo;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this._http.post(environment.url + request, {}, { headers: header });
  }

  getInscripcionesUsuario(token: string): Observable<any> {
    let request = 'api/usuariosdeportes/actividadesuser';
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this._http.get(environment.url + request, { headers: header });
  }

  getEquipos(): Observable<Array<Equipo>> {
    let request = 'api/equipos';
    return this._http.get<Array<Equipo>>(environment.url + request);
  }

  getUsuarioCapitanEventoActividad(idEventoActividad: number): Observable<Alumno> {
    let request = 'api/CapitanActividades/FindCapitanEventoActividad/' + idEventoActividad;
    return this._http.get<Alumno>(environment.url + request);
  }

  deleteEquipo(token: string, idEquipo: number): Observable<any> {
    let request = 'api/equipos/' + idEquipo;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this._http.delete(environment.url + request, { headers: header });
  }

  deleteMiembroEquipo(token: string, idMiembroEquipo: number): Observable<any> {
    let request = 'api/MiembroEquipos/' + idMiembroEquipo;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this._http.delete(environment.url + request, { headers: header });
  }
}
