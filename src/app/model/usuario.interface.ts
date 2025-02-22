import { ITipoUsuario } from "./tipoUsuario.interface";

export interface IUsuario {
  id: number;
  nombre: string;
  correo: string;
  password?: string;
  tipousuario?: ITipoUsuario;
  emailVerified: boolean;
  monedas: number;
}
