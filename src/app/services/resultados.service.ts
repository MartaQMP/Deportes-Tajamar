import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import Resultados from '../models/resultados';

@Injectable({
  providedIn: 'root',
})
export class ResultadosService {
  constructor(private _http: HttpClient) {}

  getResultados(): Observable<Resultados> {
    let request = 'api/partidoresultado';
    return this._http.get<Resultados>(environment.url + request);
  }

  getUsuariosDeEquipo(idEquipo: number): Observable<any> {
    let request = 'api/equipos/usuariosequipo/' + idEquipo;
    return this._http.get(environment.url + request);
  }

  getActividades(): Observable<any> {
    let request = 'api/actividades';
    return this._http.get(environment.url + request);
  }
}
