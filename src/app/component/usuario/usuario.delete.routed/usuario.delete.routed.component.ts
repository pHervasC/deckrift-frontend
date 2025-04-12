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
  id_Admin: number = 0;

  showConfirmModal: boolean = false;
  showSuccessModal: boolean = false;
  showErrorModal: boolean = false;
  errorMessage: string = '';

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
        this.id_Admin = data.id;
      }
    })
    this.oUsuarioService.getOne(id).subscribe({
      next: (oUsuario: IUsuario) => {
        this.oUsuario = oUsuario;
      },
      error: (err) => {
        console.error('Error al cargar el Usuario:', err);
        this.errorMessage = 'Error al cargar el usuario.';
        this.showErrorModal = true;
      }
    });
  }

  delete(): void {
    this.showConfirmModal = true;
  }

  confirmDelete(): void {
    if (this.oUsuario) {
      this.oUsuarioService.delete(this.oUsuario.id).subscribe({
        next: () => {
          this.showConfirmModal = false;
          this.showSuccessModal = true;

          if (this.id_Admin === this.oUsuario!.id) {
            this.oSessionService.logout();
          }
        },
        error: (error) => {
          console.error('Error al eliminar el Usuario:', error);
          this.showConfirmModal = false;
          this.errorMessage = 'Error al eliminar el usuario. Intenta nuevamente.';
          this.showErrorModal = true;
        }
      });
    }
  }

  cancel(): void {
    this.oRouter.navigate(['/home/registered']);
  }

  cancelDelete(): void {
    this.showConfirmModal = false;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.oRouter.navigate(['/home/registered']);
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
  }
}
