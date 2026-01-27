import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import PrecioActividad from '../models/precioActividad';
import { environment } from '../../environments/environment.development';
import { ca, es } from 'date-fns/locale';
import Pago from '../models/pago';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  constructor(private _http: HttpClient) {}

  getPreciosActividad(): Observable<Array<PrecioActividad>> {
    let request = 'api/precioactividad';
    return this._http.get<Array<PrecioActividad>>(environment.url + request);
  }

  getPagosPorEvento(idEvento: number): Observable<Array<Pago>> {
    let request = 'api/pagos/pagosevento/' + idEvento;
    return this._http.get<Array<Pago>>(environment.url + request);
  }

  putPagoCompleto(token: string, pago: number): Observable<any> {
    let request = 'api/pagos/update';
    let dataJson = JSON.stringify(pago);
    let header = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);
    return this._http.put(environment.url + request, dataJson, { headers: header });
  }

  putPago(token: string, idPago: number, cantidad: number, estado: string): Observable<any> {
    let request = 'api/pagos/updatepago/' + idPago + '/' + cantidad + '/' + estado;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this._http.put(environment.url + request, {}, { headers: header });
  }
}
