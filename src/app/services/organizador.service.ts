import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Evento from '../models/evento';
import Alumno from '../models/alumno';

@Injectable({
  providedIn: 'root',
})
export class OrganizadorService {
  url = environment.url;

  constructor(private _http: HttpClient) { }

  insertarOrganizador(idUsuario:number):Observable<any>{
    var request="api/organizadores/create/"+idUsuario;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    console.log({headers:header})
    return this._http.post<Evento>(this.url+request, null, {headers: header})
  }

  getOrganizador():Observable<any[]>{
        var request = "api/organizadores/organizadoresEvento";
        let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
        console.log({headers:header})
        return this._http.get<Alumno[]>(this.url+request, {headers: header})
  }
  deleteOrganizador(idUsuario:number):Observable<any>{
      var request = "api/Organizadores/quitarorganizadorevento/"+idUsuario;
            let header=new HttpHeaders().set("Content-type", "application/json")
            .set('Authorization', 'Bearer ' + localStorage.getItem("token"));
            return this._http.delete<boolean>(this.url+request, {headers: header})
        }

  }

