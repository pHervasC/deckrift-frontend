import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IPage } from '../../../model/model.interface';
import { CartaService } from '../../../service/carta.service';
import { ICarta } from '../../../model/carta.interface';
import { BotoneraService } from '../../../service/botonera.service';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime, Subject } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-carta-admin-selector-unrouted',
  templateUrl: './carta.admin.selector.unrouted.component.html',
  styleUrls: ['./carta.admin.selector.unrouted.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class CartaAdminSelectorUnroutedComponent implements OnInit {
  oPage: IPage<ICarta> | null = null;
  nPage: number = 0;
  nRpp: number = 10000000;
  strField: string = '';
  strDir: string = 'desc';
  strFiltro: string = '';
  arrBotonera: string[] = [];
  private debounceSubject = new Subject<string>();

  readonly dialogRef = inject(MatDialogRef<CartaAdminSelectorUnroutedComponent>);

  constructor(
    private cartaService: CartaService,
    private botoneraService: BotoneraService
  ) {
    this.debounceSubject.pipe(debounceTime(300)).subscribe(() => {
      this.getPage();
    });
  }

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    this.cartaService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<ICarta>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.botoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
        },
        error: (err) => {
          console.error('Error al obtener las cartas:', err);
        },
      });
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

  select(carta: ICarta) {
    this.dialogRef.close(carta);
  }
}
