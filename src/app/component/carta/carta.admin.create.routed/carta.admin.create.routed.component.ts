import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartaService } from '../../../service/carta.service';

@Component({
  selector: 'app-carta.admin.create.routed',
  templateUrl: './carta.admin.create.routed.component.html',
  styleUrls: ['./carta.admin.create.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
})
export class CartaAdminCreateRoutedComponent {
  oCartaForm: FormGroup;
  imagen: File | null = null;
  imagenPreview: string | null = null; // Para previsualizar la imagen

  constructor(
    private formBuilder: FormBuilder,
    private cartaService: CartaService,
    private router: Router
  ) {
    this.oCartaForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      rareza: ['', [Validators.required]],
    });
  }

  // Manejar la selección del archivo y previsualizar la imagen
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.imagen = input.files[0];

      // Crear previsualización de la imagen seleccionada
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(this.imagen);
    }
  }

  // Enviar el formulario al backend
  onSubmit(): void {
    if (this.oCartaForm.invalid || !this.imagen) {
      alert('Formulario inválido. Revisa los campos.');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.oCartaForm.get('nombre')?.value);
    formData.append('tipo', this.oCartaForm.get('tipo')?.value);
    formData.append('rareza', this.oCartaForm.get('rareza')?.value);
    formData.append('imagen', this.imagen);

    this.cartaService.create(formData).subscribe({
      next: () => {
        alert('Carta añadida correctamente');
        this.router.navigate(['/admin/carta/plist']);
      },
      error: (err) => {
        console.error('Error al añadir carta:', err);
      },
    });
  }
}
