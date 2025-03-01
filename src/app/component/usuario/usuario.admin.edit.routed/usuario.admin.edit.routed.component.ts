import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { CommonModule } from '@angular/common';
import { CryptoService } from '../../../service/crypto.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-usuario-admin-edit',
  templateUrl: './usuario.admin.edit.routed.component.html',
  styleUrls: ['./usuario.admin.edit.routed.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class UsuarioAdminEditRoutedComponent implements OnInit {
  oUsuarioForm!: FormGroup;
  usuarioId!: number;
  usuario!: IUsuario;
  showPassword: boolean = false;

  userEmail: string = '';
  id_Admin: number = 0;

  showModal: boolean = false;
  showErrorModal: boolean = false;
  errorMessage: string = "";

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private oSessionService: SessionService,
    private cryptoService: CryptoService
  ) {}

  ngOnInit(): void {
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
    this.initializeForm();
    this.loadUsuarioData();
    this.userEmail = this.oSessionService.getSessionEmail();
    this.usuarioService.getUsuarioByEmail(this.userEmail).subscribe({
      next: (data: IUsuario) => {
        this.id_Admin = data.id;
      }
    })
  }

  initializeForm(): void {
    this.oUsuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', []],
      id_tipousuario: ['', [Validators.required]],
      emailVerified: [{ value: false, disabled: true }],
      monedas: [0, [Validators.required, Validators.min(0)]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword; // Alternar la visibilidad de la contraseña
  }

  loadUsuarioData(): void {
    this.usuarioService.getOne(this.usuarioId).subscribe({
      next: (usuario: IUsuario) => {
        this.usuario = usuario;
        this.oUsuarioForm.patchValue({
          nombre: usuario.nombre,
          correo: usuario.correo,
          id_tipousuario: usuario.tipousuario?.id,
          emailVerified: usuario.emailVerified,
          monedas: usuario.monedas,
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
    if (this.oUsuarioForm.valid) {
      // Construir el objeto correctamente
      const updatedUsuario = {
        id: this.usuarioId,
        nombre: this.oUsuarioForm.value.nombre,
        correo: this.oUsuarioForm.value.correo,
        emailVerified: this.usuario.emailVerified,
        tipousuario: {
          id: this.oUsuarioForm.get('id_tipousuario')?.value,
          descripcion: '',
        },
        monedas: this.oUsuarioForm.value.monedas,
        ...(this.oUsuarioForm.value.password
          ? { password: this.cryptoService.getHashSHA256(this.oUsuarioForm.value.password) } // Hashear solo si la contraseña es proporcionada
          : {}),
      };

      this.usuarioService.update(updatedUsuario).subscribe({
        next: () => {
          this.showModal = true;
          if (this.id_Admin === this.usuario!.id) {
            this.oSessionService.logout();
          }
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.errorMessage = 'Hubo un error al actualizar el usuario. Intenta nuevamente.';
          this.showErrorModal = true;
        },
      });
    }
}

  closeModal() {
    this.showModal = false;
    this.router.navigate(['/admin/usuario/plist']);
  }

  closeErrorModal() {
    this.showErrorModal = false;
  }
}
