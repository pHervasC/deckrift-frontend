import { Component, OnInit } from '@angular/core';
import { ICompra } from '../../../model/compra.interface';
import { debounceTime, Subject } from 'rxjs';
import { IPage } from '../../../model/model.interface';
import { BotoneraService } from '../../../service/botonera.service';
import { Router } from '@angular/router';
import { CompraService } from '../../../service/compra.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compra-routed',
  templateUrl: './compra.routed.component.html',
  styleUrls: ['./compra.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CompraRoutedComponent implements OnInit {
    oPage: IPage<ICompra> | null = null;
    nPage: number = 0;
    nRpp: number = 10;
    strField: string = '';
    strDir: string = 'desc';
    strFiltro: string = '';
    estadoSeleccionado: string = 'todos';
    arrBotonera: string[] = [];
    private debounceSubject = new Subject<string>();

    estados = [
      { valor: 'todos', etiqueta: 'Todos' },
      { valor: 'pendiente', etiqueta: 'Pendientes' },
      { valor: 'completado', etiqueta: 'Completados' },
      { valor: 'cancelada', etiqueta: 'Cancelados' }
    ];

    constructor(
      private oCompraService: CompraService,
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
      let filtroCompleto = this.strFiltro;

      if (this.estadoSeleccionado !== 'todos') {
        filtroCompleto = filtroCompleto ?
          `${filtroCompleto} estado:${this.estadoSeleccionado}` :
          `estado:${this.estadoSeleccionado}`;
      }

      this.oCompraService
        .getPage(this.nPage, this.nRpp, this.strField, this.strDir, filtroCompleto)
        .subscribe({
          next: (oPageFromServer: IPage<ICompra>) => {
            this.oPage = oPageFromServer;
            this.arrBotonera = this.oBotoneraService.getBotonera(
              this.nPage,
              oPageFromServer.totalPages
            );
          },
          error: (err) => {
            console.error('Error al cargar las compras:', err);
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

    cambiarEstado(event: Event) {
      const select = event.target as HTMLSelectElement;
      this.estadoSeleccionado = select.value;
      this.nPage = 0;
      this.getPage();
    }
}
