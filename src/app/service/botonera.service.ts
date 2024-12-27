import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class BotoneraService {
  constructor() {}

  getBotonera(numPage: number, numPages: number): string[] {
    // 0-based server count
    let paginaCliente = numPage + 1;
    let paginasCliente = numPages;
    let arrBotonera = [];
    for (let i = 1; i <= paginasCliente; i++) {
      if (i == 1) {
        arrBotonera.push('1');
      } else if (i >= paginaCliente - 2 && i <= paginaCliente - -2) {
        arrBotonera.push(i.toString());
      } else if (i == paginasCliente) {
        arrBotonera.push(paginasCliente.toString());
      } else if (i == paginaCliente - 3 || i == paginaCliente - -3) {
        arrBotonera.push('...');
      }
    }
    return arrBotonera;
  }
}
