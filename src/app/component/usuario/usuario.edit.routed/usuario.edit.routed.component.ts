import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';

@Component({
  selector: 'app-usuario-edit-routed',
  templateUrl: './usuario.edit.routed.component.html',
  styleUrls: ['./usuario.edit.routed.component.css']
})
export class UsuarioEditRoutedComponent implements OnInit {
  oUsuario: IUsuario | null = null;

  constructor(
    private oUsuarioService: UsuarioService,
    private oActivatedRoute: ActivatedRoute,
    private oRouter: Router
  ) {}

  ngOnInit(): void {
    const id = this.oActivatedRoute.snapshot.params['id'];
    this.oUsuarioService.getOne(id).subscribe({
      next: (usuario) => {
        this.oUsuario = usuario;
      },
      error: (err) => {
        console.error('Error al cargar el perfil del usuario:', err);
        alert('No se pudo cargar el perfil del usuario.');
        this.onBack();
      }
    });
  }

  onEdit(): void {
    this.oRouter.navigate(['/admin/Usuario/edit', this.oUsuario?.id]);
  }

  onBack(): void {
    this.oRouter.navigate(['/']);
  }
}
