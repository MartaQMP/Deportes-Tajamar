import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import Alumno from '../models/alumno';
import Capitan from '../models/capitan';
import ActividadesEvento from '../models/actividadesevento';

@Injectable({
  providedIn: 'root',
})
export class InscripcionService {
  constructor(private _http: HttpClient) {}

  url = environment.url;

  verInscripciones(idEvento: Number, idActividad: Number): Observable<Alumno[]> {
    var request =
      'api/Inscripciones/InscripcionesUsuariosEventoActividad/' +
      idEvento +
      '?idactividad=' +
      idActividad;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this._http.get<Alumno[]>(this.url + request, { headers: header });
  }

  inscribirActividadEvento(
    idUsuario: number,
    idEventoActividad: number,
    capitan: boolean,
  ): Observable<any> {
    var request = 'api/inscripciones/create';
    var inscripcion = {
      idInscripcion: 0,
      idUsuario: idUsuario,
      idEventoActividad: idEventoActividad,
      quiereSerCapitan: capitan,
      fechaInscripcion: new Date(),
    };
    let json = JSON.stringify(inscripcion);
    console.log(json);
    let header = new HttpHeaders().set('Content-type', 'application/json');
    header.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this._http.post(this.url + request, json, { headers: header });
  }

  getUsuariosInscritosEventoCurso(idEvento: number, idCurso: number): Observable<Array<Alumno>> {
    let request = 'api/inscripciones/inscripcionesusuarioseventocurso/' + idEvento + '/' + idCurso;
    return this._http.get<Array<Alumno>>(environment.url + request);
  }

  getUsuariosCurso(idCurso: number): Observable<Array<Alumno>> {
    let request = 'api/gestionevento/usuarioscurso/' + idCurso;
    return this._http.get<Array<Alumno>>(environment.url + request);
  }

  getUsuariosCapitanEventoActividad(
    idEvento: number,
    idActividad: number,
  ): Observable<Array<Alumno>> {
    let request =
      'api/inscripciones/inscripcionesusuarioseventocapitanactividad/' +
      idEvento +
      '?idactividad=' +
      idActividad;
    return this._http.get<Array<Alumno>>(environment.url + request);
  }

  crearCapitan(capitan: Capitan): Observable<any> {
    let request = 'api/capitanactividades/create';
    let json = JSON.stringify(capitan);
    let header = new HttpHeaders().set('Content-type', 'application/json');
    return this._http.post(this.url + request, json, { headers: header });
  }

  buscarActividadEvento(idEvento: number, idActividad: number): Observable<ActividadesEvento> {
    let request = 'api/actividadesevento/findideventoactividad/' + idEvento + '/' + idActividad;
    return this._http.get<ActividadesEvento>(environment.url + request);
  }
}
