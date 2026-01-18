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

@Injectable({
  providedIn: 'root',
})
export class EquiposService {
  constructor(private _http: HttpClient) {}

  getColores(): Observable<Array<Color>> {
    let request = 'api/colores';
    return this._http.get<Array<Color>>(environment.url + request);
  }

  getCursos(): Observable<Array<Curso>> {
    let request = environment.url + 'api/GestionEvento/CursosActivos';
    return this._http.get<Array<Curso>>(request);
  }

  getAlumnosPorActividadEvento(idEvento: number, idActividad: number): Observable<Array<Alumno>> {
    let request =
      'api/inscripciones/inscripcionesusuarioseventoactividad/' +
      idEvento +
      '?idactividad=' +
      idActividad;
    return this._http.get<Array<Alumno>>(environment.url + request);
  }

  getDatosUsuario(token: string): Observable<usuarioLogeado> {
    let request = environment.url + 'api/UsuariosDeportes/Perfil';
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this._http.get<usuarioLogeado>(request, { headers: header });
  }

  getCapitanes(): Observable<Array<Capitan>> {
    let request = 'api/capitanactividades';
    return this._http.get<Array<Capitan>>(environment.url + request);
  }

  crearEquipo(equipo: any): Observable<any> {
    let request = 'api/equipos/create';
    let dataJson = JSON.stringify(equipo);
    let header = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(environment.url + request, dataJson, { headers: header });
  }

  aniadirMiembroEquipo(idUsuario: number, idEquipo: number): Observable<any> {
    let request = 'api/miembroequipos/create/' + idUsuario + '/' + idEquipo;
    let header = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(environment.url + request, { headers: header });
  }
}
