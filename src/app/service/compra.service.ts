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
    // Construir los parámetros de la consulta
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${field},${dir}`);

    // Agregar filtros si están presentes
    if (filtro && filtro.trim() !== '') {
      params = params.set('filtro', filtro);
    }
    
    // Agregar estado si está presente y no es 'todos'
    if (estado && estado !== 'todos') {
      params = params.set('estado', estado);
    }

    const url = `${this.apiUrl}/usuario/${userId}/page`;
    console.log('Solicitando compras del usuario a:', url, 'con parámetros:', params.toString());
    
    return new Observable<IPage<ICompra>>(observer => {
      this.http.get<IPage<ICompra>>(url, { params }).subscribe({
        next: (response) => {
          console.log('Respuesta de la API (compras del usuario):', response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Error al obtener compras del usuario:', error);
          observer.error(error);
        }
      });
    });
  }
}
