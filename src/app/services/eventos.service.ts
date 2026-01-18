import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import Evento from '../models/evento';

@Injectable({
  providedIn: 'root',
})
export class EventosService {

  constructor(private _http: HttpClient){}

  url= environment.url;
  
  buscarEventosAbiertos() : Observable<any[]> {
    var request = "api/eventos";
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    return this._http.get<Evento[]>(this.url+request, {headers: header})

  }

  crearEvento(fecha:Date) : Observable<any>{
    var request = "api/Eventos/create/"+fecha;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    return this._http.post<boolean>(this.url+request, {haeders: header})
  }

}
