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
    console.log({headers:header})
    return this._http.post<boolean>(this.url+request, null, {headers: header})
  }

  crearActividad(idEvento:number, idActividad:number):Observable<any>{
      var request = "api/ActividadesEvento/create?idEvento="+idEvento+"&idActividad="+idActividad;
    
      let header=new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
      return this._http.post(this.url+request, null, {headers: header})
  }

}
