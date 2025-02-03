import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleLoginService } from '../../../../service/google-login.service';
import { LoginService } from '../../../../service/login.service';
import { SessionService } from '../../../../service/session.service';
import { CryptoService } from './../../../../service/crypto.service';


@Component({
  selector: 'app-login',
  templateUrl: './shared.login.routed.component.html',
  styleUrls: ['./shared.login.routed.component.css'],
  standalone: true,
  imports: [
  FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class SharedLoginRoutedComponent implements OnInit {

  private clientId = '642946707903-742gna6lhbktomd5mmk70nj5h4rg02fv.apps.googleusercontent.com';
  errorMessage: string | null = null;

  loginForm: FormGroup = new FormGroup({});

  constructor(
    private oLoginService: LoginService,
    private oSessionService: SessionService,
    private oRouter: Router,
    private oCryptoService: CryptoService,
    private oHttp: HttpClient,
    private googleLoginService: GoogleLoginService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(5)])
    });


  }

  ngOnInit() {
    this.googleLoginService.initializeGoogleLogin(
      this.clientId,
      this.handleGoogleCredentialResponse.bind(this),
      'g_id_signin'
    );
   }

  onSubmit() {
    if (this.loginForm.valid) {
      // Encriptar la contraseña
      const hashedPassword = this.oCryptoService.getHashSHA256(this.loginForm.value.password);

      // Llamar al servicio de login
      this.oLoginService.login(this.loginForm.value.email, hashedPassword).subscribe({
        next: (token: string) => {
          alert('Inicio de sesión exitoso');

          // Almacenar el token en la sesión
          this.oSessionService.login(token);

          // Redirigir al home
          this.oRouter.navigate(['/home/registered']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al realizar la solicitud', error);
          alert('Correo o contraseña incorrectos');
          this.errorMessage = 'Correo o contraseña incorrectos';
        }
      });
    } else {
      alert('Formulario inválido. Por favor, revisa los campos.');
    }
  }

  handleGoogleCredentialResponse(response: any): void {
    const token = response.credential;

    this.oHttp.post('http://localhost:8085/api/auth/google', { token }).subscribe({
      next: (res: any) => {
        console.log('Respuesta del backend:', res);

        if (res && res.id) {
          this.oRouter.navigate(['/home']);
        } else {
          console.error('El backend no devolvió un ID válido.');
          alert('Error al procesar la autenticación. Intenta nuevamente.');
        }
      },
      error: (err) => {
        console.error('Error al autenticar:', err);
        alert('Error al autenticar con Google. Por favor, intenta nuevamente.');
      },
    });
  }


}
