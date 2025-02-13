import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { CommonModule } from '@angular/common';
import { CryptoService } from '../../../service/crypto.service';
import { HttpClient } from '@angular/common/http';
import { GoogleLoginService } from '../../../service/google-login.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-usuario-create-routed',
  templateUrl: './usuario.create.routed.component.html',
  styleUrls: ['./usuario.create.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
})
export class UsuarioCreateRoutedComponent implements OnInit {

  private clientId = '642946707903-742gna6lhbktomd5mmk70nj5h4rg02fv.apps.googleusercontent.com';
  id: any;
  oUsuarioForm: FormGroup;
  mostrarModalExito: boolean = false;
  mostrarModalError: boolean = false;
  mensajeModal: string = '';

  constructor(
    private oHttp: HttpClient,
    private oUsuarioService: UsuarioService,
    private oRouter: Router,
    private googleLoginService: GoogleLoginService,
    private cryptoService: CryptoService,
    private oSessionService: SessionService
  ) {
    this.oUsuarioForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
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
    if (this.oUsuarioForm?.invalid) {
      return;
    }

    const hashedPassword = this.cryptoService.getHashSHA256(this.oUsuarioForm.get('password')?.value);

    const usuario: IUsuario = {
      id: this.id,
      nombre: this.oUsuarioForm.get('nombre')?.value,
      correo: this.oUsuarioForm.get('email')?.value,
      password: hashedPassword,
      emailVerified: false
    };

    this.oUsuarioService.create(usuario).subscribe({
      next: () => {
        this.mensajeModal = "Tu cuenta ha sido creada correctamente. Revisa tu correo para verificar tu email.";
        this.mostrarModalExito = true;
      },
      error: (err) => {
        console.error('Error al crear el usuario:', err);
        this.mensajeModal = "Hubo un problema al crear tu cuenta. Inténtalo de nuevo.";
        this.mostrarModalError = true;
      },
    });
  }

  cerrarModal() {
    this.mostrarModalExito = false;
    this.oRouter.navigate(['/login']);
  }

  handleGoogleCredentialResponse(response: any): void {
    const googleToken = response.credential;

    this.oHttp.post<{ token: string; name: string; id: number; correo: string; tipoUsuario: number; emailVerified: boolean }>(
      'http://localhost:8085/api/auth/google',
      { token: googleToken }
    ).subscribe({
      next: (res) => {
        if (res && res.token) {
          this.oSessionService.login(res.token);

          if (res.emailVerified) {
            this.oRouter.navigate(['/home/registered']);
          } else {
            this.oRouter.navigate(['/verify-email'], { queryParams: { google: 'true' } });
          }

          this.mensajeModal = "Inicio de sesión exitoso con Google.";
          this.mostrarModalExito = true;
        } else {
          this.mensajeModal = "Hubo un problema con la autenticación de Google.";
          this.mostrarModalError = true;
        }
      },
      error: (err) => {
        console.error("Error en Google Login:", err);
        this.mensajeModal = "Error en el inicio de sesión con Google.";
        this.mostrarModalError = true;
      },
    });
  }
}
