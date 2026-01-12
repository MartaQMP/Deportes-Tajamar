import usuarioLogeado from "../models/usuarioLogeado";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment.development";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable()

export default class PerfilService {
    constructor(private _http: HttpClient) { }

    getDatosUsuario(token: string): Observable<usuarioLogeado> {

        let request = environment.url + "api/UsuariosDeportes/Perfil";
        let header = new HttpHeaders().set('Authorization', 'Bearer ' + token);
        return this._http.get<usuarioLogeado>(request, { headers: header });
    }
}
