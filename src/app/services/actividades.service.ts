import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import Evento from '../models/evento';
import ActividadEvento from '../models/actividades';

@Injectable({
  providedIn: 'root',
})
export class ActividadesService {

  constructor(private _http: HttpClient){}

  url= environment.url;
  
  buscarActividadesPorEventos(id:string) : Observable<any[]> {
    var request = "api/actividades/actividadesevento/"+id;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    return this._http.get<ActividadEvento[]>(this.url+request, {headers: header})

  }

}
