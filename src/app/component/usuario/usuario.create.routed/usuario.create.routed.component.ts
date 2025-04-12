import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  mostrarModalExitoGoogle: boolean = false;
  mostrarModalError: boolean = false;
  mensajeModal: string = '';
  showPassword: boolean = false;

  constructor(
    private cdRef: ChangeDetectorRef,
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
      emailVerified: false,
      monedas: 10,
    };

    // Mostrar mensaje inmediatamente
    this.mensajeModal = "Procesando registro...";
    this.mostrarModalExito = true;
    this.cdRef.detectChanges();

    this.oUsuarioService.create(usuario).subscribe({
      next: () => {
        this.mensajeModal = "Tu cuenta ha sido creada correctamente. Revisa tu correo para verificar tu email.";
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al crear el usuario:', err);
        this.mensajeModal = "Hubo un problema al crear tu cuenta. Inténtalo de nuevo.";
        this.mostrarModalError = true;
        this.mostrarModalExito = false;
        this.cdRef.detectChanges();
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
      'https://deckrift-backend.onrender.com/api/auth/google',
      { token: googleToken }
    ).subscribe({
      next: (res) => {
        if (res && res.token) {
          this.oSessionService.login(res.token);
          this.oRouter.navigate(['/home/registered']); // 🔹 Redirigir directamente al home

          this.mensajeModal = "Inicio de sesión exitoso con Google.";
          this.mostrarModalExito = true;
        } else {
          this.mensajeModal = "Hubo un problema con la autenticación de Google.";
          this.mostrarModalError = true;
          this.cdRef.detectChanges();
        }
      },
      error: (err) => {
        console.error("Error en Google Login:", err);
        this.mensajeModal = "Error en el inicio de sesión con Google.";
        this.mostrarModalError = true;
        this.cdRef.detectChanges();
      },
    });
  }

  togglePW(): void {

    this.showPassword = !this.showPassword;

    const passwordInput = document.querySelector<HTMLInputElement>('[formControlName="password"]');
    const eyeIcon = document.querySelector('.eye');

    if (passwordInput) {
      passwordInput.type = this.showPassword ? 'text' : 'password';
    }

    if (eyeIcon) {
      eyeIcon.classList.toggle('slash', this.showPassword);
    }
  }

}
