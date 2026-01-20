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

  crearActividad(idEvento:number, idActividad:number):Observable<any>{
      var request = "api/ActividadesEvento/create";
      var actividadEvento={
        "idEventoActividad":0,
        "idEvento":idEvento,
        "idActividad": idActividad,
      }
      let json=JSON.stringify(actividadEvento);
      console.log(json);
      let header=new HttpHeaders().set("Content-type", "application/json");
      header.append('Authorization', 'Bearer ' + localStorage.getItem("token"));
      return this._http.post<boolean>(this.url+request, json, {headers: header})
  }

}
