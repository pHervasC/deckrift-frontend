// moneda.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MonedaService {
  private monedasSubject = new BehaviorSubject<number>(0);
  public monedas$ = this.monedasSubject.asObservable();

  constructor() {}

  setMonedas(monedas: number): void {
    this.monedasSubject.next(monedas);
  }

  getMonedas(): number {
    return this.monedasSubject.getValue();
  }
}
