import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from '../models/login';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import ResponseLogin from '../models/responseLogin';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private _http: HttpClient) {}

  crearToken(login: Login): Observable<ResponseLogin> {
    let request = 'api/auth/logineventos';
    let dataJson = JSON.stringify(login);
    let header = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post<ResponseLogin>(environment.url + request, dataJson, { headers: header });
  }
}
