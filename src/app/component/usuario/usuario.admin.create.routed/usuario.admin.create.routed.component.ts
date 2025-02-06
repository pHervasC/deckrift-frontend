import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../../service/crypto.service';

@Component({
  selector: 'app-usuario-admin-create-routed',
  templateUrl: './usuario.admin.create.routed.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class UsuarioAdminCreateRoutedComponent implements OnInit {
  id: any;
  oUsuarioForm: FormGroup;
  oUsuario: IUsuario | undefined;

  constructor(
    private oUsuarioService: UsuarioService,
    private oRouter: Router,
    private cryptoService: CryptoService
  ) {
    this.oUsuarioForm = new FormGroup({
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      correo: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      id_tipousuario: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.oUsuarioForm.invalid) {
      alert('Formulario inválido. Por favor, revisa los campos.');
      return;
    }

    const hashedPassword = this.cryptoService.getHashSHA256(
      this.oUsuarioForm.get('password')?.value
    );

    const usuario: IUsuario = {
      id: this.id,
      nombre: this.oUsuarioForm.get('nombre')?.value,
      correo: this.oUsuarioForm.get('correo')?.value,
      password: hashedPassword,
      tipousuario: {
        id: this.oUsuarioForm.get('id_tipousuario')?.value,
        descripcion: '', 
      },
    };

    this.oUsuarioService.createAdmin(usuario).subscribe({
      next: (oUsuario: IUsuario) => {
        this.oUsuario = oUsuario;
        alert('Usuario creado con éxito. ID: ' + this.oUsuario.id);
        this.oRouter.navigate(['/admin/usuario/plist']);
      },
      error: (err) => {
        console.error('Error al crear el usuario:', err);
        alert('Hubo un error al crear el usuario. Por favor, intenta nuevamente.');
      },
    });
  }
}
