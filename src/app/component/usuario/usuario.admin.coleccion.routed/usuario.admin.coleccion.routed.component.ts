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
  mostrarEliminarModal: boolean = false;
  cartaSeleccionadaParaEliminar: number | null = null;
  mostrarEliminarModalPlus: boolean = false;
  cartaSeleccionadaParaEliminarPlus: number | null = null;
  mostrarVaciarModal: boolean = false;
  private debounceSubject = new Subject<string>();
  readonly dialog = inject(MatDialog);

  constructor(
    private almacenService: AlmacenService,
    private oBotoneraService: BotoneraService,
    private route: ActivatedRoute,
    private oCartaService: CartaService
  ) {
    this.debounceSubject.pipe(debounceTime(1000)).subscribe(() => {
      this.getPage();
      this.goToPage(1);
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
        this.añadirCarta(selectedCarta.id);
      }
    });
  }

  añadirCarta(cartaId: number): void {
    this.almacenService.addCarta(this.usuarioId, cartaId).subscribe({
      next: () => {
        this.getPage();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al añadir la carta:', err);
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
        const objectURL = URL.createObjectURL(blob);
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

  openEliminarModal(cartaId: number) {
    this.cartaSeleccionadaParaEliminar = cartaId;
    this.mostrarEliminarModal = true;
  }

  confirmarEliminarCarta() {
    if (this.cartaSeleccionadaParaEliminar !== null) {
      this.almacenService.deleteCarta(this.usuarioId, this.cartaSeleccionadaParaEliminar).subscribe({
        next: () => {
          this.mostrarEliminarModal = false;
          this.getPage();
        },
        error: (err) => {
          console.error('Error al eliminar la carta:', err);
        },
      });
    }
  }

  cancelarEliminar() {
    this.mostrarEliminarModal = false;
    this.cartaSeleccionadaParaEliminar = null;
  }

  openEliminarModalPlus(cartaId: number): void {
    this.cartaSeleccionadaParaEliminarPlus = cartaId;
    this.mostrarEliminarModalPlus = true;
  }

  // Confirmar eliminación completa
  confirmarEliminarCartaPlus(): void {
    if (this.cartaSeleccionadaParaEliminarPlus !== null) {
      this.almacenService
        .deleteAllCarta(
          this.usuarioId,
          this.cartaSeleccionadaParaEliminarPlus
        )
        .subscribe({
          next: () => {
            this.getPage();
            this.cerrarEliminarPlus();
          },
          error: (err) => {
            console.error(
              'Error al eliminar todas las cartas de esta cantidad:',
              err
            );
          },
        });
    }
  }

  cancelarEliminarPlus(): void {
    this.cerrarEliminarPlus();
  }

  cerrarEliminarPlus(): void {
    this.cartaSeleccionadaParaEliminarPlus = null;
    this.mostrarEliminarModalPlus = false;
  }

  openVaciarColeccionModal(): void {
    this.mostrarVaciarModal = true;
  }

  // Confirmar vaciado de colección
  confirmarVaciarColeccion(): void {
    this.almacenService.vaciarColeccion(this.usuarioId).subscribe({
      next: () => {
        this.getPage(); // Refresca la lista de cartas
        this.cerrarVaciarModal();
      },
      error: (err) => {
        console.error('Error al vaciar la colección:', err);
      },
    });
  }

  // Cancelar el vaciado
  cancelarVaciarColeccion(): void {
    this.cerrarVaciarModal();
  }

  // Cerrar el modal
  cerrarVaciarModal(): void {
    this.mostrarVaciarModal = false;
  }
}
