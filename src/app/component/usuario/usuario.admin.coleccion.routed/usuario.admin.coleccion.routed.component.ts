import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPage } from '../../../model/model.interface';
import { FormsModule } from '@angular/forms';
import { BotoneraService } from '../../../service/botonera.service';
import { debounceTime, Subject } from 'rxjs';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { IAlmacen } from '../../../model/almacen.interface';
import { AlmacenService } from '../../../service/almacen.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CartaService } from '../../../service/carta.service';
import { CartaAdminSelectorUnroutedComponent } from '../../carta/carta.admin.selector.unrouted/carta.admin.selector.unrouted.component';

@Component({
  selector: 'app-usuario-admin-coleccion-routed',
  templateUrl: './usuario.admin.coleccion.routed.component.html',
  styleUrls: ['./usuario.admin.coleccion.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class UsuarioAdminColeccionRoutedComponent implements OnInit {
  oPage: IPage<IAlmacen> | null = null;
  usuarioId!: number;
  nPage: number = 0;
  nRpp: number = 10;
  strField: string = '';
  strDir: string = 'desc';
  strFiltro: string = '';
  arrBotonera: string[] = [];
  imagenActual: string | null = null;
  cartas: IAlmacen[] = [];
  mostrarModal: boolean = false;
  private debounceSubject = new Subject<string>();
  readonly dialog = inject(MatDialog);

  constructor(
    private almacenService: AlmacenService,
    private oBotoneraService: BotoneraService,
    private route: ActivatedRoute,
    private oCartaService: CartaService
  ) {
    this.debounceSubject.pipe(debounceTime(10)).subscribe(() => {
      this.getPage();
    });
  }

  ngOnInit(): void {
    this.usuarioId = +this.route.snapshot.paramMap.get('id')!;
    this.getPage();
  }

  getPage(): void {
    this.almacenService
      .getCartasPorUsuario(this.usuarioId, this.nPage, this.nRpp, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<IAlmacen>) => {
          this.oPage = oPageFromServer;
          this.cartas = oPageFromServer.content;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
        },
        error: (err) => {
          console.error('Error al obtener las cartas:', err);
        },
      });
}


  openAddCartaModal(): void {
    const dialogRef = this.dialog.open(CartaAdminSelectorUnroutedComponent, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe((selectedCarta) => {
      if (selectedCarta) {
        console.log('Carta seleccionada:', selectedCarta);
        this.añadirCarta(selectedCarta.id);
      }
    });
  }

  añadirCarta(cartaId: number): void {
    this.almacenService.addCarta(this.usuarioId, cartaId).subscribe({
      next: () => {
        alert('Carta añadida correctamente.');
        this.getPage();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al añadir la carta:', err);
        alert('No se pudo añadir la carta.');
      },
    });
  }

  goToPage(p: number): boolean {
    if (p) {
      this.nPage = p - 1;
      this.getPage();
    }
    return false;
  }

  sort(field: string): void {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage();
  }

  goToRpp(nrpp: number): boolean {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  goToNext(): boolean {
    if (this.oPage && this.nPage + 1 < this.oPage.totalPages) {
      this.nPage++;
      this.getPage();
    }
    return false;
  }

  goToPrev() {
    this.nPage--;
    this.getPage();
    return false;
  }

  filter(event: KeyboardEvent): void {
    this.debounceSubject.next(this.strFiltro);
  }

  verImagen(id: number): void {
    this.oCartaService.getImage(id).subscribe({
      next: (blob: Blob) => {
        const objectURL = URL.createObjectURL(blob); // Convertimos el Blob en una URL válida
        this.imagenActual = objectURL;
        this.mostrarModal = true;
      },
      error: (err) => {
        console.error('Error al cargar la imagen:', err);
        this.imagenActual = null;
        this.mostrarModal = false;
      },
    });
  }

  cerrarImagen(): void {
    this.imagenActual = null;
    this.mostrarModal = false;
  }

  eliminarCarta(cartaId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta carta?')) {
      this.almacenService.deleteCarta(this.usuarioId, cartaId).subscribe({
        next: () => {
          alert('Carta eliminada correctamente.');
          this.getPage();
        },
        error: (err) => {
          console.error('Error al eliminar la carta:', err);
          alert('No se pudo eliminar la carta.');
        },
      });
    }
  }
}
