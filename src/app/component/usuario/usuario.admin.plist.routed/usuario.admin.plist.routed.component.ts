import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPage } from '../../../model/model.interface';
import { FormsModule } from '@angular/forms';
import { BotoneraService } from '../../../service/botonera.service';
import { debounceTime, Subject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { IUsuario } from '../../../model/usuario.interface';
import { UsuarioService } from '../../../service/usuario.service';;
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-usuario.admin.routed',
  templateUrl: './usuario.admin.plist.routed.component.html',
  styleUrls: ['./usuario.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})
export class UsuarioAdminPlistRoutedComponent implements OnInit {
  oPage: IPage<IUsuario> | null = null;
  //
  nPage: number = 0; // 0-based server count
  nRpp: number = 10;
  //
  strField: string = '';
  strDir: string = 'desc';
  //
  strFiltro: string = '';
  //
  arrBotonera: string[] = [];
  //
  private debounceSubject = new Subject<string>();

  constructor(
    private oUsuarioService: UsuarioService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router,
    private dialog: MatDialog
  ) {
    this.debounceSubject.pipe(debounceTime(10)).subscribe(() => {
      this.getPage();
    });
  }

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    this.oUsuarioService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<IUsuario>) => {
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

  edit(oUsuario: IUsuario) {
    this.oRouter.navigate(['admin/usuario/edit', oUsuario.id]);
  }

  view(oUsuario: IUsuario) {
    this.oRouter.navigate(['admin/usuario/view', oUsuario.id]);
  }

  remove(oUsuario: IUsuario) {
    this.oRouter.navigate(['admin/usuario/delete', oUsuario.id]);
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

  openModal(oUsuario: IUsuario) {
    const dialogRef = this.dialog.open(/* Aquí el componente que uses para el modal */, {
      height: '800px',
      maxHeight: '1200px',
      width: '80%',
      maxWidth: '90%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        console.log(result);

        // Llamada al servicio para actualizar algo en el servidor
        this.oUsuarioService.update(result).subscribe({
          next: (response: IUsuario) => {
            console.log(response);
            this.getPage();
          },
          error: (err: HttpErrorResponse) => {
            console.log(err);
          },
        });
      }
    });
    return false;
  }
}
