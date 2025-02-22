import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { loadStripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  private apiUrl = 'http://localhost:8085/stripe'; // URL de tu backend

  constructor(private http: HttpClient) { }

  crearSesionPago(usuarioId: number, cantidadMonedas: number, precio: number) {
    return this.http.post<{ sessionId: string }>(`${this.apiUrl}/crear-sesion`, {
      usuarioId,
      cantidadMonedas,
      precio
    });
  }

  async redirigirCheckout(sessionId: string): Promise<void> {
    const stripe = await loadStripe(environment.StripePublickey);
    if (!stripe) {
      console.error("❌ Error al cargar Stripe.");
      return;
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error("❌ Error al redirigir a Stripe:", error.message);
    }
  }
}
