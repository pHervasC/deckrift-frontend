import { IUsuario } from "./usuario.interface";
import { ICarta } from "./carta.interface";

export interface IAlmacen {
    id: number;
    cantidad: number;
    usuario: IUsuario;
    carta: ICarta;

}
