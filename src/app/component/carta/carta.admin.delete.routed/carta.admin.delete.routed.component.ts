import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartaService } from '../../../service/carta.service';
import { ICarta } from '../../../model/carta.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carta.admin.delete.routed',
  templateUrl: './carta.admin.delete.routed.component.html',
  styleUrls: ['./carta.admin.delete.routed.component.css'],
  standalone: true,
  imports: [ CommonModule]
})
export class CartaAdminDeleteRoutedComponent implements OnInit {
  id!: number;
  carta!: ICarta;
  imagenCarta: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private cartaService: CartaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.cargarCarta();
  }

  cargarCarta(): void {
    this.cartaService.getOne(this.id).subscribe({
      next: (data: ICarta) => {
        this.carta = data;
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

  confirmarEliminacion(): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la carta "${this.carta.nombre}"?`)) {
      this.cartaService.delete(this.id).subscribe({
        next: () => {
          alert('Carta eliminada correctamente');
          this.router.navigate(['/admin/carta/plist']);
        },
        error: (err) => {
          console.error('Error al eliminar la carta:', err);
          alert('Hubo un problema al eliminar la carta.');
        }
      });
    }
  }

  cancelarEliminacion(): void {
    this.router.navigate(['/admin/carta/plist']); // Regresa a la lista sin eliminar
  }
}
