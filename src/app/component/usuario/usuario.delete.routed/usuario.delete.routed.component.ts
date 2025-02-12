import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-usuario-delete',
  templateUrl: './usuario.delete.routed.component.html',
  styleUrls: ['./usuario.delete.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class UsuarioDeleteRoutedComponent implements OnInit {
  oUsuario: IUsuario | null = null;
  userEmail: string = '';
  permisos: string = '';

  constructor(
    private oUsuarioService: UsuarioService,
    private oActivatedRoute: ActivatedRoute,
    private oSessionService: SessionService,
    private oRouter: Router
  ) {}

  ngOnInit(): void {
    const id = this.oActivatedRoute.snapshot.params['id'];
    this.userEmail = this.oSessionService.getSessionEmail();
    this.oUsuarioService.getUsuarioByEmail(this.userEmail).subscribe({
      next: (data: IUsuario) => {
        this.permisos = data.tipousuario?.descripcion || '';
      }
    })
    this.oUsuarioService.getOne(id).subscribe({
      next: (oUsuario: IUsuario) => {
        this.oUsuario = oUsuario;
      },
      error: (err) => {
        console.error('Error al cargar el Usuario:', err);
        alert('Error al cargar el Usuario.');
        this.oRouter.navigate(['/admin/usuario/plist']);
      }
    });
  }

  delete(): void {
    if (this.oUsuario) {
      this.oUsuarioService.delete(this.oUsuario.id).subscribe({
        next: () => {
          alert(`Usuario con ID ${this.oUsuario!.id} ha sido eliminado.`);
          this.oSessionService.logout();
          this.oRouter.navigate(['/']);
        },
        error: (error) => {
          console.error('Error al eliminar el Usuario:', error);
          alert('Error al eliminar el Usuario.');
        }
      });
    }
  }

  deleteAdmin(): void {
    if (this.oUsuario) {
      this.oUsuarioService.delete(this.oUsuario.id).subscribe({
        next: () => {
          alert(`Usuario con ID ${this.oUsuario!.id} ha sido eliminado.`);
          this.oRouter.navigate(['/admin/usuario/plist']);
        },
        error: (error) => {
          console.error('Error al eliminar el Usuario:', error);
          alert('Error al eliminar el Usuario.');
        }
      });
    }
  }

  cancel(): void {
    this.oRouter.navigate(['/admin/usuario/plist']);
  }
}