import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpOptions, serverURL } from '../environment/environment';
import { Observable } from 'rxjs/internal/Observable';
import { IUsuario } from '../model/usuario.interface';
import { IPage } from '../model/model.interface';

@Injectable({
  providedIn: 'root'
})

export class UsuarioService {

  serverURL: string = serverURL + 'usuario/';

  constructor(private oHttp: HttpClient) { }

  getPage(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<IUsuario>> {
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
    return this.oHttp.get<IPage<IUsuario>>(URL, httpOptions);
  }

  getOne(id: number): Observable<IUsuario> {
    return this.oHttp.get<IUsuario>(this.serverURL + id, httpOptions);
  }

  create(oUsuario: IUsuario): Observable<IUsuario> {
    return this.oHttp.post<IUsuario>(this.serverURL, oUsuario, httpOptions);
  }

  update(oUsuario: IUsuario): Observable<IUsuario> {
    return this.oHttp.put<IUsuario>(this.serverURL, oUsuario, httpOptions);
  }

  delete(id: number): Observable<void> {
    return this.oHttp.delete<void>(this.serverURL + id, httpOptions);
  }

}
