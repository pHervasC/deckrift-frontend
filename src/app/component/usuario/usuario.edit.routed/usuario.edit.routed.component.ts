import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { CommonModule } from '@angular/common';
import { CryptoService } from '../../../service/crypto.service';

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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private cryptoService: CryptoService // Servicio de encriptación
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
    });
  }

  loadUsuarioData(): void {
    this.usuarioService.getOne(this.usuarioId).subscribe({
      next: (usuario: IUsuario) => {
        this.usuario = usuario;
        this.oUsuarioForm.patchValue({
          nombre: usuario.nombre,
          email: usuario.correo,
        });
      },
      error: (err) => console.error('Error al cargar datos del usuario:', err),
    });
  }

  onSubmit(): void {
    if (this.oUsuarioForm.valid) {
      const updatedUsuario = {
        id: this.usuarioId,
        nombre: this.oUsuarioForm.value.nombre,
        correo: this.oUsuarioForm.value.email, // Asegúrate de usar "correo"
        password: this.cryptoService.getHashSHA256(this.oUsuarioForm.value.password), // Hasheamos la contraseña
      };

      console.log("Enviando datos al backend:", updatedUsuario); // Verifica qué se envía al backend

      this.usuarioService.update(updatedUsuario).subscribe({
        next: () => {
          alert('Usuario actualizado con éxito');
          this.router.navigate(['/usuario/coleccion', this.usuarioId]);
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
        },
      });
    }
  }

}
