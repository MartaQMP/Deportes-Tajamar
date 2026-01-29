import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import Inscripciones from '../models/inscripciones';
import Alumno from '../models/alumno';
import Capitan from '../models/capitan';
import ActividadesEvento from '../models/actividadesevento';
import Inscripcion from '../models/inscripcion';

@Injectable({
  providedIn: 'root',
})
export class InscripcionService {
  constructor(private _http: HttpClient) {}

  url = environment.url;

  verInscripciones(idEvento: Number, idActividad: Number): Observable<Inscripciones[]> {
    var request =
      'api/Inscripciones/InscripcionesUsuariosEventoActividad/' +
      idEvento +
      '?idactividad=' +
      idActividad;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this._http.get<Inscripciones[]>(this.url + request, { headers: header });
  }

  inscribirActividadEventoUsuario(
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
    let header = new HttpHeaders()
      .set('Content-type', 'application/json')
      .set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this._http.post(this.url + request, json, { headers: header });
  }

  inscribirActividadEvento(
    idEventoActividad: number,
    capitan: boolean,
    token: string,
  ): Observable<any> {
    var request = 'api/UsuariosDeportes/InscribirmeEvento/' + idEventoActividad + '/' + capitan;
    const header = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this._http.post(this.url + request, {}, { headers: header });
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

  crearCapitan(token: string, idEventoActividad:number, idUsuario:number): Observable<any> {
    let request = 'api/capitanactividades/create';
    var capitan={
      "idCapitanActividad":0,
      "idEventoActividad":idEventoActividad,
      "idUsuario":idUsuario
    }
    let json = JSON.stringify(capitan);
    let header = new HttpHeaders()
      .set('Content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token);
    return this._http.post(this.url + request, json, { headers: header });
  }

  buscarActividadEvento(idEvento: number, idActividad: number): Observable<ActividadesEvento> {
    let request = 'api/actividadesevento/findideventoactividad/' + idEvento + '/' + idActividad;
    return this._http.get<ActividadesEvento>(environment.url + request);
  }

  getInscripciones(): Observable <Array<Inscripcion>>{
    let request = 'api/inscripciones'
    return this._http.get<Array<Inscripcion>>(environment.url + request)
  }
}
