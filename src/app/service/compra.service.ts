import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPage } from '../model/model.interface';
import { ICompra } from '../model/compra.interface';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = 'https://deckrift-backend.onrender.com/compra';

  constructor(private http: HttpClient) { }

  getPage(page: number, size: number = 10, field: string, dir: string, filtro?: string, estado?: string): Observable<IPage<ICompra>> {
    let params = `page=${page}&size=${size}&sort=${field},${dir}`;

    if (filtro) params += `&correo=${filtro}`;
    if (estado) params += `&estado=${estado}`;

    return this.http.get<IPage<ICompra>>(`${this.apiUrl}/page?${params}`);
  }

  getAllCompras(field: string, dir: string, filtro?: string, estado?: string): Observable<IPage<ICompra>> {
    return this.getPage(0, 999999, field, dir, filtro, estado);
  }
}
