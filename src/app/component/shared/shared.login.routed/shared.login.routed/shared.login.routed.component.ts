import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  mostrarModalExito: boolean = false;
  mostrarModalError: boolean = false;
  showPassword: boolean = false; // Añadida variable para mostrar/ocultar contraseña

  loginForm: FormGroup = new FormGroup({});

  constructor(
    private oLoginService: LoginService,
    private oSessionService: SessionService,
    private oRouter: Router,
    private oCryptoService: CryptoService,
    private oHttp: HttpClient,
    private googleLoginService: GoogleLoginService,
    private cdRef: ChangeDetectorRef,
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

  // Añadido método para mostrar/ocultar contraseña
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // Encriptar la contraseña
      const hashedPassword = this.oCryptoService.getHashSHA256(this.loginForm.value.password);
      // Llamar al servicio de login
      this.oLoginService.login(this.loginForm.value.email, hashedPassword).subscribe({
        next: (token: string) => {
          // Almacenar el token en la sesión
          this.oSessionService.login(token);
          this.mostrarModalExito = true;
          this.cdRef.detectChanges(); // Forzar detección de cambios
        },
        error: (error: HttpErrorResponse) => {
          this.mostrarModalError = true;
          this.errorMessage = 'Correo o contraseña incorrectos';
          this.cdRef.detectChanges(); // Forzar detección de cambios
        }
      });
    }
  }

  cerrarModalExito() {
    this.mostrarModalExito = false;
    this.oRouter.navigate(['/home/registered']);
  }

  cerrarModalError() {
    this.mostrarModalError = false;
  }

  handleGoogleCredentialResponse(response: any): void {
    const googleToken = response.credential;

    this.oHttp.post<{ token: string; name: string; id: number; correo: string; tipoUsuario: number }>(
      'http://localhost:8085/api/auth/google',
      { token: googleToken }
    ).subscribe({
      next: (res) => {
        if (res && res.token) {
          this.oSessionService.login(res.token);
          this.mostrarModalExito = true;
          this.cdRef.detectChanges();
        } else {
          this.mostrarModalError = true;
          this.cdRef.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error en la autenticación de Google', err);
        this.mostrarModalError = true;
        this.cdRef.detectChanges();
      },
    });
  }
}
