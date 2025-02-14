import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { CommonModule } from '@angular/common';
import { CryptoService } from '../../../service/crypto.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-usuario-edit-routed',
  templateUrl: './usuario.edit.routed.component.html',
  styleUrls: ['./usuario.edit.routed.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class UsuarioEditRoutedComponent implements OnInit {
  oUsuarioForm!: FormGroup;
  usuarioId!: number;
  usuario!: IUsuario;

  showSuccessModal: boolean = false;
  showErrorModal: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private cryptoService: CryptoService, // Servicio de encriptación
    private oSessionService: SessionService,
  ) {}

  ngOnInit(): void {
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
    this.initializeForm();
    this.loadUsuarioData();
  }

  initializeForm(): void {
    this.oUsuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // Campo de contraseña no obligatorio
      emailVerified: [{ value: '', disabled: true }]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  loadUsuarioData(): void {
    this.usuarioService.getOne(this.usuarioId).subscribe({
      next: (usuario: IUsuario) => {
        this.usuario = usuario;
        this.oUsuarioForm.patchValue({
          nombre: usuario.nombre,
          email: usuario.correo,
          emailVerified: usuario.emailVerified
        });
      },
      error: (err) => {
        console.error('Error al cargar datos del usuario:', err);
        this.errorMessage = 'No se pudo cargar la información del usuario.';
        this.showErrorModal = true;
      },
    });
  }


  onSubmit(): void {
    if (this.oUsuarioForm.invalid) {
      this.errorMessage = 'Formulario inválido. Por favor, revisa los campos.';
      this.showErrorModal = true;
      return;
    }

    const updatedUsuario = {
      id: this.usuarioId,
      nombre: this.oUsuarioForm.value.nombre,
      correo: this.oUsuarioForm.value.email,
      emailVerified: this.oUsuarioForm.get('emailVerified')?.value,
      ...(this.oUsuarioForm.value.password
        ? { password: this.cryptoService.getHashSHA256(this.oUsuarioForm.value.password) }
        : {}),
    };

    this.usuarioService.update(updatedUsuario).subscribe({
      next: () => {
        this.showSuccessModal = true;
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        this.errorMessage = 'Hubo un error al actualizar el usuario. Intenta nuevamente.';
        this.showErrorModal = true;
      },
    });
  }


  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/home']);
    this.oSessionService.logout();
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
  }

}
