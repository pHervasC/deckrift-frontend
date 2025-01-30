import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';


declare const google: any;

@Component({
  selector: 'app-usuario-admin-create.routed',
  templateUrl: './usuario.admin.create.routed.component.html',
  styleUrls: ['./usuario.admin.create.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
})
export class UsuarioAdminCreateRoutedComponent implements OnInit {

  id: any;
  oUsuarioForm: FormGroup;
  strMessage: string = '';

  constructor(
    private oHttp: HttpClient,
    private oUsuarioService: UsuarioService,
    private oRouter: Router
  ) {
    this.oUsuarioForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnInit() {
    this.initializeGoogleLogin();
  }

  onSubmit() {
    if (this.oUsuarioForm?.invalid) {
      alert('Formulario inválido. Por favor, revisa los campos e intenta nuevamente.');
      return;
    } else {
      const usuario: IUsuario = {
        id: this.id,
        nombre: this.oUsuarioForm.get('nombre')?.value,
        correo: this.oUsuarioForm.get('email')?.value,
        password: this.oUsuarioForm.get('password')?.value,
      };

      this.oUsuarioService.create
      (usuario).subscribe({
        next: (oUsuario: IUsuario) => {
          alert('Usuario creado con éxito. ID asignado: ' + oUsuario.id);
          this.oRouter.navigate(['/admin/usuario/plist']);
        },
        error: (err) => {
          console.error('Error al crear el usuario:', err);
          alert('Hubo un error al crear el usuario. Por favor, intenta nuevamente.');
        },
      });
    }
  }

  initializeGoogleLogin(): void {
    (window as any ).google.accounts.id.initialize({
      client_id: '642946707903-742gna6lhbktomd5mmk70nj5h4rg02fv.apps.googleusercontent.com',
      callback: this.handleGoogleCredentialResponse.bind(this),
    });

    (window as any ).google.accounts.id.renderButton(
      document.getElementById('g_id_signin'),
      {
        theme: 'outline',
        size: 'large',
      }
    );
  }

  handleGoogleCredentialResponse(response: any) {
    const token = response.credential;

    this.oHttp.post('http://localhost:8085/api/auth/google', { token }).subscribe({
      next: (res: any) => {
        console.log('Respuesta del backend:', res);
  
        if (res && res.id) {
          this.oRouter.navigate([`/home`]);
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
