import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../service/session.service';
import { IUsuario } from '../../../model/usuario.interface';
import { UsuarioService } from '../../../service/usuario.service';

@Component({
  selector: 'app-shared-menu-unrouted',
  templateUrl: './shared.menu.unrouted.component.html',
  styleUrls: ['./shared.menu.unrouted.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class SharedMenuUnroutedComponent implements OnInit {

  strRuta: string = '';
  activeSession: boolean = false;
  userEmail: string = '';
  permisos: string = '';
  id: number = 0;
  nombre: string = '';

  constructor(
    private oRouter: Router,
    private oSessionService: SessionService,
    private oUsuarioService: UsuarioService
  ) {
    this.oRouter.events.subscribe((oEvent) => {
      if (oEvent instanceof NavigationEnd) {
        this.strRuta = oEvent.url;
      }
    });
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
      this.oUsuarioService.getUsuarioByEmail(this.userEmail).subscribe({
        next: (data: IUsuario) => {
          this.permisos = data.tipousuario?.descripcion || '';
          this.id = data.id;
          this.nombre = data.nombre;
        }
      })
    }
  }
  ngOnInit() {
    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.activeSession = true;
        this.userEmail = this.oSessionService.getSessionEmail();
        this.oUsuarioService.getUsuarioByEmail(this.userEmail).subscribe({
          next: (data: IUsuario) => {
            this.permisos = data.tipousuario?.descripcion || '';
            this.id = data.id;
            this.nombre = data.nombre;
          }
        })
      },
    });
    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.userEmail = '';
      },
    });
  }

  verColeccion(idUsuario: number) {
    this.oRouter.navigate(['usuario/coleccion', idUsuario]);
}
}
