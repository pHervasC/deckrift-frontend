import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPage } from '../model/model.interface';
import { ICompra } from '../model/compra.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = 'http://localhost:8085/compra';

  constructor(private http: HttpClient) { }

  getPage(
    page: number,
    size: number,
    field: string = 'id',
    dir: string = 'asc',
    filtro: string = ''
  ): Observable<IPage<ICompra>> {
    const params: any = {
      page,
      size,
      sort: `${field},${dir}`
    };

    if (filtro && filtro.trim() !== '') {
      params.filter = filtro;
    }

    return this.http.get<IPage<ICompra>>(`${this.apiUrl}/page`, { params });
  }
}
