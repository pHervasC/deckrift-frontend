import { Component, OnInit } from '@angular/core';
import { StripeService } from '../../../service/stripe.service';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../service/session.service';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-shop.routed',
  templateUrl: './shop.routed.component.html',
  styleUrls: ['./shop.routed.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ShopRoutedComponent implements OnInit {
  usuarioId!: number;
  cantidadSeleccionada = 100;
  precio = 5.00;

  private preciosPorCantidad = {
    100: 5.00,
    500: 20.00,
    1000: 35.00
  };

  constructor(
    private stripeService: StripeService,
    private sessionService: SessionService,
    private usuarioService: UsuarioService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarUsuario();
  }

  private async cargarUsuario(): Promise<void> {
    try {
      const userEmail = this.sessionService.getSessionEmail();
      if (!userEmail) {
        return;
      }

      const usuario = await firstValueFrom(this.usuarioService.getUsuarioByEmail(userEmail));

      if (usuario) {
        this.usuarioId = usuario.id;
      }
    } catch (error) {
      console.error("❌ Error al obtener usuario:", error);
    }
  }

  private actualizarPrecio(): void {
    this.precio = this.preciosPorCantidad[this.cantidadSeleccionada as keyof typeof this.preciosPorCantidad] || 5.00;
  }

  async comprarMonedas(): Promise<void> {
    if (!this.usuarioId) {
      console.warn("⚠️ No se ha cargado el usuario, no se puede proceder con la compra.");
      return;
    }

    this.actualizarPrecio();

    try {
      const response = await firstValueFrom(this.stripeService.crearSesionPago(
        this.usuarioId,
        this.cantidadSeleccionada,
        this.precio
      ));

      if (response?.sessionId) {
        await this.stripeService.redirigirCheckout(response.sessionId);
      }

    } catch (error) {
      console.error("Error al iniciar pago con Stripe:", error);
    }
  }
}
