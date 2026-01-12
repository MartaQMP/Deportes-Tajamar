export default class usuarioLogeado {
    constructor(
        public idUsuario: number,
        public nombre: string,
        public apellidos: string,
        public email: string,
        public estadoUsuario: boolean,
        public imagen: string,
        public idRole: number,
        public role: string,
        public idCurso: number,
        public curso: string,
        public idCursoUsuario: number
    ) { }
}