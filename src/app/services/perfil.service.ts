import usuarioLogeado from '../models/usuarioLogeado';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import UsuarioActividad from '../models/usuarioActividad';
import Alumno from '../models/alumno';

@Injectable({
  providedIn: 'root', // <--- ESTA LÍNEA ES LA MAGIA
})
export default class PerfilService {
  constructor(private _http: HttpClient) {}

  getDatosUsuario(token: string): Observable<usuarioLogeado> {
    let request = environment.url + 'api/UsuariosDeportes/Perfil';
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this._http.get<usuarioLogeado>(request, { headers: header });
  }

  findUsuario(idUsu:number):Observable<Alumno>{
    let request = environment.url + 'api/UsuariosDeportes/FindUsuarioById/'+idUsu;
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem("token"));
    return this._http.get<Alumno>(request, { headers: header });
  }

  getActividadesUsuario(token: string): Observable<UsuarioActividad> {
    let request = environment.url + 'api/UsuariosDeportes/ActividadesUser';
    let header = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this._http.get<UsuarioActividad>(request, { headers: header });
  }
}
