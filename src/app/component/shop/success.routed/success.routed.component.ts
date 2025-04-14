import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-success.routed',
  templateUrl: './success.routed.component.html',
  styleUrls: ['./success.routed.component.css']
})
export class SuccessRoutedComponent implements OnInit {

  mensaje: string = "Verificando pago...";

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

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

    this.http.get<boolean>(`https://deckrift-backend.onrender.com/stripe/confirmar-pago?session_id=${sessionId}`).subscribe({
        next: (respuesta) => {
            console.log("✅ Respuesta del backend:", respuesta);
            if (respuesta === true) {
              this.mensaje = "✅ Pago confirmado. Se han añadido tus monedas.";

              setTimeout(() => {
                this.router.navigate(['/home/registered']).then(() => {
                  window.location.reload();
                });
              }, 3000);

            } else {
              this.mensaje = "❌ No se pudo verificar el pago.";
            }

        },
        error: (error) => {
            console.error("❌ Error en la verificación:", error);
            this.mensaje = "❌ Error: No se pudo verificar el pago.";
        }
    });
}

}
