export default class ResponseLogin {
  constructor(
    public response: string,
    public role: string,
    public permisosusuario: string,
    public idRole: number,
  ) {}
}
