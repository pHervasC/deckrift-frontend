import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IUsuario } from '../../../model/usuario.interface';
import { UsuarioService } from '../../../service/usuario.service';
import { RouterModule } from '@angular/router';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-shared.home.registered.routed',
  templateUrl: './shared.home.registered.routed.component.html',
  styleUrls: ['./shared.home.registered.routed.component.css'],
  standalone: true,
  imports: [
    RouterModule
  ]
})
export class SharedHomeRegisteredRoutedComponent implements OnInit {

  fotoDni: string | undefined;
  modalImage: string = '';
  strRuta: string = '';
  activeSession: boolean = false;
  userEmail: string = '';
  id: number = 0;

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
          this.id = data.id;
        }
      })
    }
  }

  ngOnInit(): void {
    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.activeSession = true;
        this.userEmail = this.oSessionService.getSessionEmail();
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
    this.oRouter.navigate(['admin/usuario/coleccion', idUsuario]);
}


}
