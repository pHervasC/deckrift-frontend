import { Component, inject, OnInit } from '@angular/core';
import { ICarta } from '../../../model/carta.interface';
import { debounceTime, Subject } from 'rxjs';
import { IPage } from '../../../model/model.interface';
import { BotoneraService } from '../../../service/botonera.service';
import { Router, RouterModule } from '@angular/router';
import { CartaService } from '../../../service/carta.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carta.admin.plist.routed',
  templateUrl: './carta.admin.plist.routed.component.html',
  styleUrls: ['./carta.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class CartaAdminPlistRoutedComponent implements OnInit {
  oPage: IPage<ICarta> | null = null;
  nPage: number = 0;
  nRpp: number = 6; // Ajuste para el grid 3x3
  strField: string = '';
  strDir: string = 'desc';
  strFiltro: string = '';
  arrBotonera: string[] = [];
  imagenes: { [key: number]: string } = {}; // Diccionario para almacenar las imágenes
  isLoading: boolean = false;

  private debounceSubject = new Subject<string>();

  constructor(
    private oCartaService: CartaService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router
  ) {
    this.debounceSubject.pipe(debounceTime(300)).subscribe(() => {
      this.getPage();
    });
  }

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    this.isLoading = true; // 🔥 Activar loader antes de la búsqueda
    this.oCartaService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<ICarta>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
          this.cargarImagenes(); // Cargar las imágenes automáticamente

          setTimeout(() => {
            this.isLoading = false; // 🔥 Asegurar que el loader se vea por al menos 1 segundo
          }, 1000);
        },
        error: (err) => {
          console.error(err);
          setTimeout(() => {
            this.isLoading = false;
          }, 1000);
        },
      });
  }

  cargarImagenes() {
    if (this.oPage?.content) {
      this.oPage.content.forEach((carta) => {
        this.oCartaService.getImage(carta.id).subscribe({
          next: (blob: Blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              this.imagenes[carta.id] = reader.result as string; // Asignar la imagen al diccionario
            };
            reader.readAsDataURL(blob);
          },
          error: (err) => {
            console.error(`Error al cargar la imagen de la carta ${carta.id}:`, err);
          },
        });
      });
    }
  }

  filter(event: KeyboardEvent) {
    this.isLoading = true; // 🔥 Activar loader en la búsqueda
    this.debounceSubject.next(this.strFiltro);
  }

  goToPage(p: number) {
    if (p) {
      this.nPage = p - 1;
      this.getPage();
    }
    return false;
  }

  goToNext() {
    this.nPage++;
    this.getPage();
    return false;
  }

  goToPrev() {
    this.nPage--;
    this.getPage();
    return false;
  }
}
