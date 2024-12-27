import { IUsuario } from "./usuario.interface";
import { ICarta } from "./carta.interface";

export interface IAlmacen {
    id: number;
    usuario: IUsuario;
    carta: ICarta;
    cantidad: number;
}
