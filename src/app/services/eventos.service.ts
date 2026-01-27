import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import Evento from '../models/evento';
import Profesores from '../models/profesores';

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
    return this._http.post<Evento>(this.url+request, null, {headers: header})
  }

  crearActividad(idEvento:number, idActividad:number):Observable<any>{
      var request = "api/ActividadesEvento/create/"+idEvento+"/"+idActividad;
    
      let header=new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
      return this._http.post(this.url+request, null, {headers: header})
  }

  getProfesor():Observable<Profesores[]>{
    var request =  "api/ProfesEventos/ProfesActivos";
    let header=new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    return this._http.get<Profesores[]>(this.url+request, {headers: header})
  }
  getProfesorSinEvento():Observable<Profesores[]>{
    var request =  "api/ProfesEventos/ProfesSinEventos";
    let header=new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    return this._http.get<Profesores[]>(this.url+request, {headers: header})
  }
  postProfesorEvento(idEvento:number, idProfesor:number){
     var request = "api/profeseventos/asociarprofesorEvento/"+idEvento+"/"+idProfesor;
    
      let header=new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
      return this._http.post(this.url+request, null, {headers: header})
  }
  eliminarEvento(idEvento:number):Observable<any>{
  var request = "api/Eventos/deleteeventopanic/"+idEvento;
      let header=new HttpHeaders().set("Content-type", "application/json")
      .set('Authorization', 'Bearer ' + localStorage.getItem("token"));
       return this._http.delete<boolean>(this.url+request, {headers: header})
  }

}
