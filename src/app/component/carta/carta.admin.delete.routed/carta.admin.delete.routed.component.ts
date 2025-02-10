import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartaService } from '../../../service/carta.service';
import { ICarta } from '../../../model/carta.interface';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from '../../modal/ConfirmModal/ConfirmModal.component';


@Component({
  selector: 'app-carta-admin-delete-routed',
  templateUrl: './carta.admin.delete.routed.component.html',
  styleUrls: ['./carta.admin.delete.routed.component.css'],
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
})
export class CartaAdminDeleteRoutedComponent implements OnInit {
  id!: number;
  carta!: ICarta;
  imagenCarta: string | null = null;
  mostrarModal: boolean = false;

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
      error: (err) => console.error('Error al obtener la carta:', err),
    });
  }

  cargarImagen(): void {
    this.cartaService.getImage(this.id).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagenCarta = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: () => {
        this.imagenCarta = null;
      },
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  confirmarEliminacion(): void {
    this.cartaService.delete(this.id).subscribe({
      next: () => {
        this.mostrarModal = false;
        this.router.navigate(['/admin/carta/plist']);
      },
      error: (err) => {
        console.error('Error al eliminar la carta:', err);
      },
    });
  }

  cancelarEliminacion(): void {
    this.mostrarModal = false;
  }

  cancelar(): void {
    this.router.navigate(['/admin/carta/plist']);
  }
}
