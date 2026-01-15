import Curso from "../models/curso";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment.development";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import Alumno from "../models/alumno";

@Injectable({
    providedIn: 'root'
})

export default class CursosService {
    constructor(private _http: HttpClient) { }

    getCursos(): Observable<Array<Curso>> {
        let request = environment.url + "api/GestionEvento/CursosActivos";
        return this._http.get<Array<Curso>>(request);
    }

    getAlumnosCurso(idcurso: string): Observable<Array<Alumno>> {
        let request = environment.url + "api/GestionEvento/UsuariosCurso/" + idcurso
        return this._http.get<Array<Alumno>>(request);
    }

}