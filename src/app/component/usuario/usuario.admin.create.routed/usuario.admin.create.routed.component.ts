import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { CommonModule } from '@angular/common';

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
    private oUsuarioService: UsuarioService,
    private oRouter: Router
  ) {
    this.oUsuarioForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnInit(): void {}

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
          // Redirigir a la lista de usuarios o página principal después de crear
          this.oRouter.navigate(['/admin/usuario/plist']);
        },
        error: (err) => {
          console.error('Error al crear el usuario:', err);
          alert('Hubo un error al crear el usuario. Por favor, intenta nuevamente.');
        },
      });
    }
  }

}
