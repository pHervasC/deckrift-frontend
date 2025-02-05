import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../../service/crypto.service';

@Component({
  selector: 'app-usuario-admin-create-routed',
  templateUrl: './usuario.admin.create.routed.component.html',
  styleUrls: ['./usuario.admin.create.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class UsuarioAdminCreateRoutedComponent implements OnInit {
  oUsuarioForm: FormGroup;
  id: any;

  constructor(
    private oUsuarioService: UsuarioService,
    private oRouter: Router,
    private cryptoService: CryptoService
  ) {
    this.oUsuarioForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      correo: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      isAdmin: new FormControl(false),
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.oUsuarioForm.invalid) {
      alert('Formulario inválido. Por favor, revisa los campos e intenta nuevamente.');
      return;
    } else {
      const hashedPassword = this.cryptoService.getHashSHA256(this.oUsuarioForm.get('password')?.value);
      const tipoIdUsuario = this.oUsuarioForm.get('isAdmin')?.value ? 1 : 2;

      const usuario: IUsuario = {
        id: this.id,
        nombre: this.oUsuarioForm.get('nombre')?.value,
        correo: this.oUsuarioForm.get('correo')?.value,
        password: hashedPassword,
        tipousuario: {
          id: tipoIdUsuario,
          descripcion: ''
        },
      };

      this.oUsuarioService.createAdmin(usuario).subscribe({
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
}
