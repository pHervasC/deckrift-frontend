import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartaService } from '../../../service/carta.service';
import { ICarta } from '../../../model/carta.interface';

@Component({
  selector: 'app-carta.admin.create.routed',
  templateUrl: './carta.admin.create.routed.component.html',
  styleUrls: ['./carta.admin.create.routed.component.css'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, ReactiveFormsModule
  ],
})
export class CartaAdminCreateRoutedComponent{

  oCartaForm: FormGroup;
  imagen: File | null = null;

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

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.imagen = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.oCartaForm.invalid || !this.imagen) {
      alert('Formulario inválido. Revisa los campos.');
      return;
    }
  
    // Crear el objeto ICarta a partir de los datos del formulario
    const nuevaCarta: ICarta = {
      id: 0, // O el valor adecuado si el backend genera el ID automáticamente
      nombre: this.oCartaForm.get('nombre')?.value,
      tipo: this.oCartaForm.get('tipo')?.value,
      rareza: this.oCartaForm.get('rareza')?.value,
      imagen: this.imagen, // Directamente el archivo seleccionado
    };
  
    // Llamar al servicio con el objeto ICarta
    this.cartaService.create(nuevaCarta).subscribe({
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

