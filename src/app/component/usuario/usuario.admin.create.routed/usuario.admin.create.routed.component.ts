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

  showModal: boolean = false;
  showErrorModal: boolean = false;
  createdUserId: number | null = null;
  errorMessage: string = '';
  showPassword: boolean = false;

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
      this.errorMessage = 'Formulario inválido. Por favor, revisa los campos.';
      this.showErrorModal = true;
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
      emailVerified: true,
      tipousuario: {
        id: this.oUsuarioForm.get('id_tipousuario')?.value,
        descripcion: '',
      },
    };

    this.oUsuarioService.createAdmin(usuario).subscribe({
      next: (oUsuario: IUsuario) => {
        this.oUsuario = oUsuario;
        this.showModal = true;
      },
      error: (err) => {
        console.error('Error al crear el usuario:', err);
        this.errorMessage = 'Hubo un error al crear el usuario. Por favor, intenta nuevamente.';
        this.showErrorModal = true;
      },
    });
  }

  closeModal() {
    this.showModal = false;
    this.oRouter.navigate(['/admin/usuario/plist']);
  }

  closeErrorModal() {
    this.showErrorModal = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

}
