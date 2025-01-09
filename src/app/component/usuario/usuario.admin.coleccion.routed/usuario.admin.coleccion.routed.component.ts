import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPage } from '../../../model/model.interface';
import { FormsModule } from '@angular/forms';
import { BotoneraService } from '../../../service/botonera.service';
import { debounceTime, Subject } from 'rxjs';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { IAlmacen } from '../../../model/almacen.interface';
import { AlmacenService } from '../../../service/almacen.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CartaService } from '../../../service/carta.service';

@Component({
  selector: 'app-usuario.admin.coleccion.routed',
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
  private debounceSubject = new Subject<string>();
  readonly dialog = inject(MatDialog);

  constructor(
    private almacenService: AlmacenService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router,
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
      .getCartasPorUsuario(this.usuarioId, this.nPage, this.nRpp)
      .subscribe({
        next: (oPageFromServer: IPage<IAlmacen>) => {
          console.log('Cartas del usuario:', oPageFromServer);
          this.cartas = oPageFromServer.content;
          this.arrBotonera = this.oBotoneraService.getBotonera(this.nPage, oPageFromServer.totalPages);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error al obtener las cartas del usuario:', err);
        },
      });
  }

  addCartasAleatorias(): void {
    this.almacenService.addCartasAleatorias(this.usuarioId, 5).subscribe({
      next: (response: string) => {
        console.log(response);
        this.getPage();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al añadir cartas:', err);
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

  goToNext(): boolean {
    this.nPage++;
    this.getPage();
    return false;
  }

  goToPrev(): boolean {
    if (this.nPage > 0) {
      this.nPage--;
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

  filter(event: KeyboardEvent): void {
    this.debounceSubject.next(this.strFiltro);
  }

  verImagen(id: number): void {
    this.oCartaService.getImage(id).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagenActual = reader.result as string; // Convertir el blob a data URL
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('Error al cargar la imagen:', err);
        this.imagenActual = null;
      },
    });
  }

  cerrarImagen(): void {
    this.imagenActual = null; // Cierra el modal
  }


}
