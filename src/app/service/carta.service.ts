import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpOptions, serverURL } from '../environment/environment';
import { Observable } from 'rxjs/internal/Observable';
import { ICarta } from '../model/carta.interface';
import { IPage } from '../model/model.interface';

@Injectable({
  providedIn: 'root'
})

export class CartaService {

  private serverURL: string = 'http://localhost:8085/carta';

  constructor(private oHttp: HttpClient) { }

  getPage(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<ICarta>> {
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
    return this.oHttp.get<IPage<ICarta>>(URL, httpOptions);
  }

  getAllCards(
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<ICarta>> {
    let URL: string = this.serverURL;
    URL += '?page=0';
    URL += '&size=151'; // Get all 151 cards at once
    if (field) {
      URL += '&sort=' + field;
      URL += dir === 'asc' ? ',asc' : ',desc';
    }
    if (filtro) URL += '&filter=' + filtro;
    return this.oHttp.get<IPage<ICarta>>(URL, httpOptions);
  }

  getOne(id: number): Observable<ICarta> {
    return this.oHttp.get<ICarta>(`${this.serverURL}/${id}`, httpOptions);
  }

  create(formData: FormData): Observable<any> {
    return this.oHttp.post<any>(`${this.serverURL}/carta`, formData, {
      headers: { 'enctype': 'multipart/form-data' },
    });
  }

  update(id: number, formData: FormData): Observable<ICarta> {
    return this.oHttp.put<ICarta>(`${this.serverURL}/${id}`, formData, {headers: { 'enctype': 'multipart/form-data' }});
  }

  delete(id: number): Observable<void> {
    return this.oHttp.delete<void>(`${this.serverURL}/${id}`, httpOptions);
  }

  getImage(id: number) {
    return this.oHttp.get(`${this.serverURL}/${id}/imagen`, { responseType: 'blob' });
  }
}
