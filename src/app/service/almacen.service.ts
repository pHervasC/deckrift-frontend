import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ICarta } from '../model/carta.interface';
import { CartaService } from './carta.service';
import { IAlmacen } from '../model/almacen.interface';
import { httpOptions } from '../environment/environment';
import { IPage } from '../model/model.interface';



@Injectable({
  providedIn: 'root',
})
export class AlmacenService {
  private serverURL: string = 'http://localhost:8085/almacen';

  constructor(private oHttp: HttpClient) {}

  // Obtener la colección de cartas de un usuario
  getCartasPorUsuario(usuarioId: number, page: number, size: number, filtro: string = ''): Observable<IPage<IAlmacen>> {
    let URL = `${this.serverURL}/cartas/${usuarioId}?page=${page}&size=${size}`;
    if (filtro) URL += `&filter=${encodeURIComponent(filtro)}`;

    return this.oHttp.get<IPage<IAlmacen>>(URL);
}


    getPage(
      page: number,
      size: number,
      field: string,
      dir: string,
      filtro: string
    ): Observable<IPage<IAlmacen>> {
      let URL: string = this.serverURL;
      if (!page) page = 0;
      URL += '?page=' + page;
      if (!size) size = 10;
      URL += '&size=' + size;
      if (field) {
        URL += '&sort=' + field;
        URL += dir === 'asc' ? ',asc' : ',desc';
      }
      if (filtro) URL += '&filter=' + filtro;
      return this.oHttp.get<IPage<IAlmacen>>(URL, httpOptions);
    }


  // Añadir cartas aleatorias a un usuario
  addCartasAleatorias(usuarioId: number, cantidad: number): Observable<string> {
    return this.oHttp.post(`${this.serverURL}/addCartas/${usuarioId}`, { cantidad }, { responseType: 'text' });
  }

  deleteCarta(usuarioId: number, cartaId: number) {
    return this.oHttp.delete(`${this.serverURL}/delete/${usuarioId}/${cartaId}`);
  }

  addCarta(usuarioId: number, cartaId: number): Observable<any> {
    return this.oHttp.post(`${this.serverURL}/add/${usuarioId}/${cartaId}`, {});
  }

}
