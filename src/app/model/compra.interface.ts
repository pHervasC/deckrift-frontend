export interface ICompra {
  id: number;
  usuario?: {
    id: number;
    email: string;
  };
  cantidadMonedas: number;
  gasto: number;
  estado: string;
}
