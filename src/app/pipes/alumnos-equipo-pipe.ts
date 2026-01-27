import { Pipe, PipeTransform } from '@angular/core';
import { ResultadosService } from '../services/resultados.service';
import { Observable, map, of } from 'rxjs';

@Pipe({
  name: 'alumnosEquipoPipe',
  standalone: true,
})
export class AlumnosEquipoPipe implements PipeTransform {
  constructor(private _service: ResultadosService) {}

  transform(idEquipo: number): Observable<any[]> {
    if (!idEquipo) return of([]);

    return this._service.getUsuariosDeEquipo(idEquipo).pipe(
      map((alumnos) => {
        return alumnos;
      })
    );
  }
}
