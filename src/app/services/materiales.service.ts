import Material from "../models/material";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment.development";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import Actividad from "../models/actividad";
import usuarioLogeado from "../models/usuarioLogeado";

@Injectable({
    providedIn: 'root'
})

export default class MaterialesService {
    constructor(private _http: HttpClient) { }

    getidEventoActividad(idEvento: number, idActividad: number):Observable<any>{
        let request = environment.url + "api/ActividadesEvento/FindIdEventoActividad/" + idEvento + "/" + idActividad
        return this._http.get(request);        
    }

    getMaterialesActividad(idEventoActividad: number): Observable<Array<Material>> {
        let request = environment.url + "api/Materiales/MaterialesActividad/" + idEventoActividad
        return this._http.get<Array<Material>>(request);
    }

    crearMaterial(newMaterial: Material): Observable<any> {
        let request = environment.url + "api/Materiales/create";
        let json = JSON.stringify(newMaterial);
        let header = new HttpHeaders().set('Content-type', 'application/json');
        return this._http.post(request, json, {headers: header});
    }

    actualizarMaterial(newMaterial: Material): Observable<any> {
        let request = environment.url + "api/Materiales/update";
        let json = JSON.stringify(newMaterial);
        let header = new HttpHeaders().set('Content-type', 'application/json');
        return this._http.put(request, json, {headers: header});
    }

    eliminarMaterial(idMaterial: number): Observable<any>{
        let request = environment.url + "api/Materiales/" + idMaterial;
        return this._http.delete(request);
    }

    getUsuarioAportadorMaterial(idUsuario: number): Observable<usuarioLogeado>{
        let request = environment.url + "api/UsuarioDeportes/FindUsuarioById/"+idUsuario;
        return this._http.get<usuarioLogeado>(request);
    }

}