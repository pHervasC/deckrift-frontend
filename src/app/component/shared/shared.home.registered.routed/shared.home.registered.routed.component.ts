import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionService } from '../../../service/session.service';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';

@Component({
  selector: 'app-shared-home-registered-routed',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './shared.home.registered.routed.component.html',
  styleUrls: ['./shared.home.registered.routed.component.css']
})
export class SharedHomeRegisteredRoutedComponent implements OnInit, OnDestroy {

  id: number = 0;
  user: IUsuario | null = null;
  status: HttpErrorResponse | null = null;

  constructor(
    private oSessionService: SessionService,
    private oUsuarioService: UsuarioService,
    private oRouter: Router
  ) { }

  ngOnInit() {
    this.getUser();
  }

  ngOnDestroy() {
    // No es necesario limpiar intervalos porque usamos un sprite estático
  }

  getUser(): void {
    const email = this.oSessionService.getSessionEmail();
    if (email) {
      this.oUsuarioService.getUsuarioByEmail(email)
        .subscribe({
          next: (data: IUsuario) => {
            this.user = data;
            if (this.user) {
              this.id = this.user.id;
            }
          },
          error: (error: HttpErrorResponse) => {
            this.status = error;
            this.oRouter.navigate(['/login']);
          }
        });
    } else {
      this.oRouter.navigate(['/login']);
    }
  }

  logout() {
    this.oSessionService.logout();
    this.oRouter.navigate(['/login']);
  }

  goToCollection() {
    this.oRouter.navigate(['/usuario/coleccion', this.id]);
  }

  goToPokedex() {
    this.oRouter.navigate(['/pokedex']);
  }
}
