import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { CommonModule } from '@angular/common';
import { CryptoService } from '../../../service/crypto.service';

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

  showModal: boolean = false;
  showErrorModal: boolean = false;
  errorMessage: string = "";

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private cryptoService: CryptoService
  ) {}

  ngOnInit(): void {
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
    this.initializeForm();
    this.loadUsuarioData();
  }

  initializeForm(): void {
    this.oUsuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', []], // Sin `Validators.required`, es opcional
      id_tipousuario: ['', [Validators.required]],
    });
  }

  loadUsuarioData(): void {
    this.usuarioService.getOne(this.usuarioId).subscribe({
      next: (usuario: IUsuario) => {
        this.usuario = usuario;
        this.oUsuarioForm.patchValue({
          nombre: usuario.nombre,
          correo: usuario.correo,
          id_tipousuario: usuario.tipousuario?.id,
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
        tipousuario: {
          id: this.oUsuarioForm.get('id_tipousuario')?.value,
          descripcion: '',
        },
        ...(this.oUsuarioForm.value.password
          ? { password: this.cryptoService.getHashSHA256(this.oUsuarioForm.value.password) } // Hashear solo si la contraseña es proporcionada
          : {}),
      };

      this.usuarioService.update(updatedUsuario).subscribe({
        next: () => {
          this.showModal = true;
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
