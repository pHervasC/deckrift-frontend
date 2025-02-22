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

  getPage(page: number, size: number, field: string, dir: string, filtro?: string, estado?: string): Observable<IPage<ICompra>> {
    let params = `page=${page}&size=${size}&sort=${field},${dir}`;

    if (filtro) params += `&correo=${filtro}`;
    if (estado) params += `&estado=${estado}`;

    return this.http.get<IPage<ICompra>>(`${this.apiUrl}/page?${params}`);
  }


}
