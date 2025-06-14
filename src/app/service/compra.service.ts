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

    if (filtro) params += `&filtro=${filtro}`;
    if (estado) params += `&estado=${estado}`;

    return this.http.get<IPage<ICompra>>(`${this.apiUrl}/page?${params}`);
  }

  getAllCompras(field: string, dir: string, filtro?: string, estado?: string): Observable<IPage<ICompra>> {
    return this.getPage(0, 999999, field, dir, filtro, estado);
  }

  getPageByUsuario(userId: number, page: number, size: number, field: string, dir: string, filtro?: string, estado?: string): Observable<IPage<ICompra>> {
    let params = `page=${page}&size=${size}&sort=${field},${dir}&usuario_id=${userId}`;

    if (filtro) params += `&filtro=${filtro}`;
    if (estado) params += `&estado=${estado}`;

    const url = `${this.apiUrl}/page?${params}`;
    console.log('Solicitando compras a:', url);
    
    return new Observable<IPage<ICompra>>(observer => {
      this.http.get<IPage<ICompra>>(url).subscribe({
        next: (response) => {
          console.log('Respuesta de la API (compras):', response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Error al obtener compras:', error);
          observer.error(error);
        }
      });
    });
  }
}
