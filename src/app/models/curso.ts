export default class Curso {
    constructor(
    public idCurso: number,
    public nombre: string,
    public fechaInicio: Date,
    public fechaFin: Date,
    public activo: boolean
    ){}
}