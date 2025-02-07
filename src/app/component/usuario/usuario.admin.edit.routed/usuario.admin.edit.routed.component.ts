import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario-edit-routed',
  templateUrl: './usuario.admin.edit.routed.component.html',
  styleUrls: ['./usuario.admin.edit.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
})
export class UsuarioAdminEditRoutedComponent implements OnInit {
  oUsuario!: IUsuario;
  oUsuarioForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private oUsuarioService: UsuarioService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router
  ) {}

  ngOnInit(): void {
    // Inicializa el formulario vacío antes de obtener los datos
    this.oUsuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
    });

    const id = this.oActivatedRoute.snapshot.params['id'];
    this.oUsuarioService.getOne(id).subscribe({
      next: (usuario: IUsuario) => {
        this.oUsuario = usuario;
        this.initializeForm(); // Actualiza el formulario con los datos del usuario
      },
      error: (err) => {
        console.error('Error al cargar el usuario:', err);
        alert('No se pudo cargar el usuario.');
        this.onBack();
      }
    });
  }

  initializeForm(): void {
    this.oUsuarioForm = this.fb.group({
      nombre: [this.oUsuario.nombre, [Validators.required, Validators.minLength(3)]],
      correo: [this.oUsuario.correo, [Validators.required, Validators.email]],
    });
  }

  onEdit(): void {
    if (this.oUsuarioForm?.invalid) {
      alert('Formulario inválido. Por favor, revisa los campos e intenta nuevamente.');
      return;
    }

    const usuario: IUsuario = {
      id: this.oUsuario?.id,
      nombre: this.oUsuarioForm.get('nombre')?.value,
      correo: this.oUsuarioForm.get('correo')?.value,
      password: this.oUsuarioForm.get('password')?.value,
    };

    this.oUsuarioService.update(usuario).subscribe({
      next: (oUsuarioActualizado: IUsuario) => {
        alert('Usuario actualizado con éxito.');
        this.oRouter.navigate(['/admin/usuario/plist']);
      },
      error: (err) => {
        console.error('Error al actualizar el usuario:', err);
        alert('Hubo un error al actualizar el usuario. Por favor, intenta nuevamente.');
      },
    });
  }

  onBack(): void {
    this.oRouter.navigate(['/admin/usuario/plist']);
  }
}
