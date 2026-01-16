import { Pipe, PipeTransform } from '@angular/core';
import { ResultadosService } from '../services/resultados.service';
import { Observable, map } from 'rxjs';

@Pipe({
  name: 'nombreEquipo',
  standalone: true,
})
export class NombreEquipoPipe implements PipeTransform {
  constructor(private _service: ResultadosService) {}
  transform(id: number): Observable<string> {
    return this._service.buscarEquipoPorId(id).pipe(
      map((equipo) => {
        return equipo.nombreEquipo;
      })
    );
  }
}
