import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { CommonModule } from '@angular/common';
import { CryptoService } from '../../../service/crypto.service';
import { HttpClient } from '@angular/common/http';
import { GoogleLoginService } from '../../../service/google-login.service';

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
  mostrarModalExito: boolean = false; // Controla la visibilidad del modal

  constructor(
    private oHttp: HttpClient,
    private oUsuarioService: UsuarioService,
    private oRouter: Router,
    private googleLoginService: GoogleLoginService,
    private cryptoService: CryptoService
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
    };

    this.oUsuarioService.create(usuario).subscribe({
      next: () => {
        this.mostrarModalExito = true; // Muestra el modal de éxito
      },
      error: (err) => {
        console.error('Error al crear el usuario:', err);
      },
    });
  }

  cerrarModal() {
    this.mostrarModalExito = false;
    this.oRouter.navigate(['/login']); // Redirige al usuario al login después de cerrar el modal
  }

  handleGoogleCredentialResponse(response: any): void {
    const token = response.credential;

    this.oHttp.post('http://localhost:8085/api/auth/google', { token }).subscribe({
      next: (res: any) => {
        if (res && res.id) {
          this.oRouter.navigate(['/home']);
        } else {
          console.error('El backend no devolvió un ID válido.');
        }
      },
      error: (err) => {
        console.error('Error al autenticar:', err);
      },
    });
  }
}
