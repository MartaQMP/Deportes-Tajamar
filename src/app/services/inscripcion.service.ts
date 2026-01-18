import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import Inscripciones from '../models/inscripciones';

@Injectable({
  providedIn: 'root',
})
export class InscripcionService {
 
  
  constructor(private _http: HttpClient){}

  url = environment.url;

  verInscripciones(idEvento:Number, idActividad:Number):Observable<Inscripciones[]>{
    var request = "api/Inscripciones/InscripcionesUsuariosEventoActividad/"+idEvento+"?idactividad="+idActividad;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    return this._http.get<Inscripciones[]>(this.url+ request, {headers: header});
  }

  inscribirActividadEvento(idUsuario:number, idEventoActividad:number, capitan:boolean):Observable<any>{
      var request = "api/inscripciones/create";
      var inscripcion={
        "idInscripcion":0,
        "idUsuario": idUsuario,
        "idEventoActividad":idEventoActividad,
        "quiereSerCapitan": capitan,
        "fechaInscripcion" : new Date()
      }
      let json=JSON.stringify(inscripcion);
      console.log(json);
      let header=new HttpHeaders().set("Content-type", "application/json");
      header.append('Authorization', 'Bearer ' + localStorage.getItem("token"));
      return this._http.post(this.url + request, json, {headers:header})
  }
}
