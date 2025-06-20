import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../service/session.service';
import { IUsuario } from '../../../model/usuario.interface';
import { UsuarioService } from '../../../service/usuario.service';
import { MonedaService } from '../../../service/moneda.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shared-menu-unrouted',
  templateUrl: './shared.menu.unrouted.component.html',
  styleUrls: ['./shared.menu.unrouted.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class SharedMenuUnroutedComponent implements OnInit {

  strRuta: string = '';
  activeSession: boolean = false;
  userEmail: string = '';
  permisos: string = '';
  id: number = 0;
  nombre: string = '';
  monedas: number = 0;
  isMobileMenuOpen: boolean = false;

  constructor(
    private oRouter: Router,
    private oSessionService: SessionService,
    private oUsuarioService: UsuarioService,
    private monedaService: MonedaService,
  ) {
    this.monedaService.monedas$.subscribe(m => this.monedas = m);
    this.oRouter.events.subscribe((oEvent) => {
      if (oEvent instanceof NavigationEnd) {
        this.strRuta = oEvent.url;
        this.isMobileMenuOpen = false;
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
          this.monedas = data.monedas;
          this.monedaService.setMonedas(this.monedas);
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
            this.monedas = data.monedas;
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

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
