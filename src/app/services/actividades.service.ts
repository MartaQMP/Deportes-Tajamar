import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import Evento from '../models/evento';
import ActividadEvento from '../models/actividades';
import UsuarioActividad from '../models/usuarioActividad';
import Actividad from '../models/actividad';
import PrecioActividad from '../models/precioActividad';

@Injectable({
  providedIn: 'root',
})
export class ActividadesService {

  constructor(private _http: HttpClient){}

  url= environment.url;
  
  buscarActividadesPorEventos(id:string) : Observable<ActividadEvento[]> {
    var request = "api/actividades/actividadesevento/"+id;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    return this._http.get<ActividadEvento[]>(this.url+request, {headers: header})

  }

  verUsuarioApuntado():Observable<UsuarioActividad[]>{
    var request="api/UsuariosDeportes/ActividadesUser";
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    return this._http.get<UsuarioActividad[]>(this.url+request, {headers: header});

  }

  getActividades():Observable<any>{
    var request="api/actividades";
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    return this._http.get<Actividad[]>(this.url+request, {headers: header});
  }

  insertarPrecioActividad(idActividadEvento: number, precio:number):Observable<any>{
    var request = "api/PrecioActividad/create";
    var precioTotal={
        "idPrecioActividad":0,
        "idEventoActividad":idActividadEvento,
        "precioTotal": precio,
      }
      let json=JSON.stringify(precioTotal);
      console.log(json);
      let header=new HttpHeaders().set("Content-type", "application/json")
      .set('Authorization', 'Bearer ' + localStorage.getItem("token"));
      return this._http.post<boolean>(this.url+request, json, {headers: header})
  }

  getPrecioActividadPorEvento():Observable<any>{
    var request = "api/precioActividad";
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    return this._http.get<PrecioActividad[]>(this.url+request, {headers: header});
  }

  deleteActividadEvento(idActividadEvento:number):Observable<any>{
    var request = "api/ActividadesEvento/"+idActividadEvento;
      let header=new HttpHeaders().set("Content-type", "application/json")
      .set('Authorization', 'Bearer ' + localStorage.getItem("token"));
       return this._http.delete<boolean>(this.url+request, {headers: header})

  }

  deleteActividadEventoPrecio(idPrecioActividad:number):Observable<any>{
    var request = "api/PrecioActividad/"+idPrecioActividad;
      let header=new HttpHeaders().set("Content-type", "application/json")
      .set('Authorization', 'Bearer ' + localStorage.getItem("token"));
       return this._http.delete<boolean>(this.url+request, {headers: header})

  }

  crearActividad(nombre:string, minimo:number):Observable<any>{
  var request = "api/Actividades/create";
      var actividad={
          "idActividad":0,
          "nombre":nombre,
          "minimoJugadores": minimo,
        }
        let json=JSON.stringify(actividad);
        console.log(json);
        let header=new HttpHeaders().set("Content-type", "application/json")
        .set('Authorization', 'Bearer ' + localStorage.getItem("token"));
        return this._http.post<boolean>(this.url+request, json, {headers: header})
    }
}
