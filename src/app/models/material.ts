export default class Material {
    constructor(
    public idMaterial: number,
    public idEventoActividad: number,
    public idUsuario: number,
    public nombreMaterial: string,
    public pendiente: boolean,
    public fechaSolicitud: Date,
    public idUsuarioAportacion: number
    ){}
}