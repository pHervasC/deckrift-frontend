import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartaService } from '../../../service/carta.service';
import { ICarta } from '../../../model/carta.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carta.admin.edit.routed',
  templateUrl: './carta.admin.edit.routed.component.html',
  styleUrls: ['./carta.admin.edit.routed.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class CartaAdminEditRoutedComponent implements OnInit {
  id!: number;
  carta!: ICarta;
  oCartaForm!: FormGroup;
  imagenCarta: string | null = null; // URL de la imagen actual o nueva
  nuevaImagen: File | null = null; // Nueva imagen seleccionada por el usuario

  constructor(
    private route: ActivatedRoute,
    private cartaService: CartaService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.oCartaForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      rareza: ['', [Validators.required]],
    });
    this.cargarCarta();
  }

  cargarCarta(): void {
    this.cartaService.getOne(this.id).subscribe({
      next: (data: ICarta) => {
        this.carta = data;
        this.oCartaForm.patchValue({
          nombre: data.nombre,
          tipo: data.tipo,
          rareza: data.rareza,
        });
        this.cargarImagen();
      },
      error: (err) => {
        console.error('Error al obtener la carta:', err);
      }
    });
  }

  cargarImagen(): void {
    this.cartaService.getImage(this.id).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagenCarta = reader.result as string; // Convertir Blob en URL base64
        };
        reader.readAsDataURL(blob);
      },
      error: () => {
        this.imagenCarta = null;
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.nuevaImagen = input.files[0];

      // Generar la vista previa de la nueva imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenCarta = reader.result as string; // Actualizar la URL base64 para previsualizar
      };
      reader.readAsDataURL(this.nuevaImagen);
    }
  }

  onSubmit(): void {
    if (this.oCartaForm.invalid) {
      alert('Formulario inválido. Revisa los campos.');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.oCartaForm.get('nombre')?.value);
    formData.append('tipo', this.oCartaForm.get('tipo')?.value);
    formData.append('rareza', this.oCartaForm.get('rareza')?.value);

    if (this.nuevaImagen) {
      formData.append('imagen', this.nuevaImagen);
    }

    this.cartaService.update(this.id, formData).subscribe({
      next: () => {
        alert('Carta actualizada correctamente');
        this.router.navigate(['/admin/carta/plist']);
      },
      error: (err) => {
        console.error('Error al actualizar la carta:', err);
      }
    });
  }
}
