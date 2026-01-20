import { Injectable } from '@angular/core';
import Capitan from '../models/capitan';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private _http: HttpClient) {}

  getCapitanes(): Observable<Array<Capitan>> {
    let request = 'api/capitanactividades';
    return this._http.get<Array<Capitan>>(environment.url + request);
  }
}
