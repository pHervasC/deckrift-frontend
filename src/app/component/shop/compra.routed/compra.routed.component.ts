import { Component, OnInit } from '@angular/core';
import { ICompra } from '../../../model/compra.interface';
import { debounceTime, Subject } from 'rxjs';
import { IPage } from '../../../model/model.interface';
import { BotoneraService } from '../../../service/botonera.service';
import { Router } from '@angular/router';
import { CompraService } from '../../../service/compra.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


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
    compras: ICompra[] = [];
    arrBotonera: string[] = [];
    private debounceSubject = new Subject<string>();

    estados = [
      { valor: 'todos', etiqueta: 'Todos' },
      { valor: 'pendiente', etiqueta: 'Pendientes' },
      { valor: 'completado', etiqueta: 'Completados' },
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
      const estado = this.estadoSeleccionado !== 'todos' ? this.estadoSeleccionado : undefined;

      this.oCompraService
        .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro, estado)
        .subscribe({
          next: (oPageFromServer: IPage<ICompra>) => {
            this.oPage = oPageFromServer;
            this.compras = oPageFromServer.content;
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

    generarPDF() {
      const doc = new jsPDF();
      doc.text('Historial de Compras', 14, 10);

      autoTable(doc, {
        head: [['ID', 'Usuario', 'Cantidad', 'Gasto (€)', 'Estado']],
        body: this.compras.map((compra: ICompra) => [
          compra.id,
          compra.usuario.id,
          compra.cantidadMonedas,
          compra.gasto,
          compra.estado
        ]),
        startY: 20,
      });

      doc.save('historial_compras.pdf');
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
      this.goToPage(1);
    }
}
