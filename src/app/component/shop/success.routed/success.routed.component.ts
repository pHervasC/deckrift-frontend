import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StripeService } from '../../../service/stripe.service';

@Component({
  selector: 'app-success.routed',
  templateUrl: './success.routed.component.html',
  styleUrls: ['./success.routed.component.css']
})
export class SuccessRoutedComponent implements OnInit {

  mensaje: string = "Verificando pago...";

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private stripeService: StripeService) {}

  ngOnInit(): void {
    this.verificarPago();
  }

  verificarPago(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    console.log("🔍 session_id recibido en frontend:", sessionId);

    if (!sessionId) {
      this.mensaje = "❌ Error: No se encontró el session_id.";
      return;
    }

    // 1. Primero verificamos el estado de la sesión
    this.stripeService.verificarEstadoSesion(sessionId).subscribe({
      next: (respuesta) => {
        console.log("✅ Estado de la sesión:", respuesta);
        
        // 2. Si el estado es 'complete', confirmamos el pago
        if (respuesta.status === 'complete') {
          this.confirmarPago(sessionId);
        } else {
          this.mensaje = "❌ El pago no se ha completado correctamente.";
        }
      },
      error: (error) => {
        console.error("❌ Error al verificar la sesión:", error);
        this.mensaje = "❌ Error al verificar el estado del pago.";
      }
    });
  }

  private confirmarPago(sessionId: string): void {
    this.http.get<boolean>(`https://deckrift-backend.onrender.com/stripe/confirmar-pago?session_id=${sessionId}`).subscribe({
      next: (respuesta) => {
        console.log("✅ Pago confirmado:", respuesta);
        this.mensaje = "✅ Pago confirmado. Se han añadido tus monedas.";

        setTimeout(() => {
          this.router.navigate(['/home/registered']).then(() => {
            window.location.reload();
          });
        }, 3000);
      },
      error: (error) => {
        console.error("❌ Error al confirmar el pago:", error);
        this.mensaje = "❌ No se pudo confirmar el pago.";
      }
    });
  }
}
