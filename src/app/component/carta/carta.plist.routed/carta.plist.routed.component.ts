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
  selector: 'app-carta.plist.routed',
  templateUrl: './carta.plist.routed.component.html',
  styleUrls: ['./carta.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class CartaPlistRoutedComponent implements OnInit {
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
    this.debounceSubject.pipe(debounceTime(1000)).subscribe(() => {
      this.getPage();
      this.goToPage(1);
    });
  }

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    this.isLoading = true;
    this.oCartaService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<ICarta>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
          this.cargarImagenes(); 
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
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

  sort(field: string) {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage();
  }

  goToRpp(nrpp: number) {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  filter(event: KeyboardEvent) {
    this.isLoading = true;
    this.debounceSubject.next(this.strFiltro);
  }
}
