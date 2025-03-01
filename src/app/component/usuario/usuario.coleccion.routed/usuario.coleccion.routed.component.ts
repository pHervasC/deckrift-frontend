import { Component, inject, OnInit } from '@angular/core';
import { IAlmacen } from '../../../model/almacen.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IPage } from '../../../model/model.interface';
import { AlmacenService } from '../../../service/almacen.service';
import { BotoneraService } from '../../../service/botonera.service';
import { CartaService } from '../../../service/carta.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';

@Component({
  selector: 'app-usuario.coleccion.routed',
  templateUrl: './usuario.coleccion.routed.component.html',
  styleUrls: ['./usuario.coleccion.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class UsuarioColeccionRoutedComponent implements OnInit {

  cartaSeleccionada: any = null;
  oPage: IPage<IAlmacen> | null = null;
  usuarioId!: number;
  usuario!: IUsuario;
  nPage: number = 0;
  nRpp: number = 6; // Mostrar 6 cartas por página
  strFiltro: string = '';
  arrBotonera: string[] = [];
  imagenes: { [key: number]: string } = {}; // Almacena imágenes en caché
  cartas: IAlmacen[] = [];
  nombre: string = '';
  isLoading: boolean = false;

  private debounceSubject = new Subject<string>();
  readonly dialog = inject(MatDialog);
  oRouter: any;

  constructor(
    private almacenService: AlmacenService,
    private oBotoneraService: BotoneraService,
    private oUsuarioService: UsuarioService,
    private route: ActivatedRoute,
    private oCartaService: CartaService,
  ) {
    this.debounceSubject.pipe(debounceTime(1000)).subscribe(() => {
      this.goToPage(0);
    });
  }

  ngOnInit(): void {
    this.usuarioId = +this.route.snapshot.paramMap.get('id')!;
    this.getone();
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
          this.cartas.forEach((carta) => this.cargarImagen(carta.carta.id));
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error al obtener las cartas del usuario:', err);
          this.isLoading = false;
        },
      });
  }

  getone(): void {
    this.oUsuarioService.getOne(this.usuarioId).subscribe({
      next: (usuario: IUsuario) => {
        this.usuario = usuario;
        this.nombre = usuario.nombre;
      }
    })
  }

  cargarImagen(id: number): void {
    if (!this.imagenes[id]) {
      this.oCartaService.getImage(id).subscribe({
        next: (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.imagenes[id] = reader.result as string;
          };
          reader.readAsDataURL(blob);
        },
        error: (err) => {
          console.error(`Error al cargar la imagen de la carta ${id}:`, err);
        },
      });
    }
  }

  goToPage(p: number): void {
    this.nPage = p;
    this.getPage();
  }

  goToNext(): void {
    if (this.oPage && this.nPage + 1 < this.oPage.totalPages) {
      this.nPage++;
      this.getPage();
    }
  }

  goToPrev(): void {
    if (this.nPage > 0) {
      this.nPage--;
      this.getPage();
    }
  }

  filter(event: KeyboardEvent) {
    this.isLoading = true;
    this.debounceSubject.next(this.strFiltro);
  }

  mostrarPopUp(carta: any): void {
    this.cartaSeleccionada = carta;
  }

  cerrarPopUp(): void {
    this.cartaSeleccionada = null;
  }
}
