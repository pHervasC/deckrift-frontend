import { Component, inject, OnInit } from '@angular/core';
import { ICarta } from '../../../model/carta.interface';
import { MatDialog } from '@angular/material/dialog';
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
    //
    nPage: number = 0;
    nRpp: number = 10;
    //
    strField: string = '';
    strDir: string = 'desc';
    //
    strFiltro: string = '';
    //
    arrBotonera: string[] = [];
    imagenActual: string | null = null;
    //
    private debounceSubject = new Subject<string>();
    readonly dialog = inject(MatDialog);

    constructor(
      private oCartaService: CartaService,
      private oBotoneraService: BotoneraService,
      private oRouter: Router,
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
      this.oCartaService
        .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
        .subscribe({
          next: (oPageFromServer: IPage<ICarta>) => {
            console.log(oPageFromServer);
            this.oPage = oPageFromServer;
            this.arrBotonera = this.oBotoneraService.getBotonera(
              this.nPage,
              oPageFromServer.totalPages
            );
          },
          error: (err) => {
            console.log(err);
          },
        });
    }

    edit(oCarta: ICarta) {
      this.oRouter.navigate(['admin/carta/edit', oCarta.id]);
    }

    view(oCarta: ICarta) {
      this.oRouter.navigate(['admin/carta/view', oCarta.id]);
    }

    remove(oCarta: ICarta) {
      this.oRouter.navigate(['admin/carta/delete', oCarta.id]);
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
      this.debounceSubject.next(this.strFiltro);
    }

    verImagen(id: number): void {
      this.oCartaService.getImage(id).subscribe({
        next: (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.imagenActual = reader.result as string;
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
