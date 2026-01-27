export default class Pago {
  constructor(
    public id: number,
    public idEvento: number,
    public fechaEvento: string,
    public idEventoActividad: number,
    public idActividad: number,
    public actividad: string,
    public idPrecioActividad: number,
    public precioTotal: number,
    public idPago: number,
    public cantidadPagada: number,
    public idCurso: number,
    public curso: string,
    public estado: string,
  ) {}
}

// CLASE AUXILIAR PARA AGRUPAR LOS PAGOS POR CURSO
export class CursoPagos {
  constructor(
    public nombreCurso: string,
    public idCurso: number,
    public pagos: Array<Pago>,
  ) {}
}
