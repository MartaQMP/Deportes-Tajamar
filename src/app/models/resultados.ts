export default class Resultados {
  constructor(
    public idPartidoResultado: number,
    public idEventoActividad: number,
    public idEquipoLocal: number,
    public idEquipoVisitante: number,
    public puntosLocal: number,
    public puntosVisitante: number
  ) {}
}
