import Material from "../models/material";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment.development";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export default class MaterialesService {
    constructor(private _http: HttpClient) { }

    getMaterialesActividad(idEvento: number): Observable<Array<Material>> {
        let request = environment.url + "api/Materiales/MaterialesActividad/" + idEvento
        return this._http.get<Array<Material>>(request);
    }

    crearMaterial(newMaterial: Material): Observable<any> {
        let request = environment.url + "api/Materiales/create";
        let json = JSON.stringify(newMaterial);
        let header = new HttpHeaders().set('Content-type', 'application/json');
        return this._http.post(request, json, {headers: header});

    }

}