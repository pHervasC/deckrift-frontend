import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verified-email-routed',
  templateUrl: './verified.email.routed.component.html',
  styleUrls: ['./verified.email.routed.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class VerifiedEmailRoutedComponent implements OnInit {
  mensaje: string = 'Verificando tu correo...';
  googleUser: boolean = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');

    if (email) {
      this.http.get(`https://deckrift-backend.onrender.com/api/auth/verify-email?email=${email}`, { responseType: 'text' }).subscribe({
        next: () => {
          this.mensaje = '✅ Tu email ha sido verificado con éxito.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: () => {
          this.mensaje = '❌ Hubo un error verificando tu correo.';
        }
      });
    } else {
      this.mensaje = '❌ Enlace de verificación inválido.';
    }
  }
}
