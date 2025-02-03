import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IUsuario } from '../../../model/usuario.interface';
import { UsuarioService } from '../../../service/usuario.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-shared.byemail.routed',
  templateUrl: './shared.byemail.routed.component.html',
  styleUrls: ['./shared.byemail.routed.component.css'],
  standalone: true,
  imports: [
    RouterModule
  ]
})
export class SharedByemailRoutedComponent implements OnInit {
  email: string = '';
  oUsuario: IUsuario = {} as IUsuario;
  fotoDni: string | undefined;
  modalImage: string = '';
  oRouter: any;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oUsuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.email = this.oActivatedRoute.snapshot.params['email'];
    this.getOne();
  }

  getOne() {
    this.oUsuarioService.getUsuarioByEmail(this.email).subscribe({
      next: (data: IUsuario) => {
        this.oUsuario = data;
      },
      error: (err) => {
        console.error('Error al obtener los datos del Usuario', err);
      },
    });
  }

  verColeccion(idUsuario: number) {
    this.oRouter.navigate(['admin/usuario/coleccion', idUsuario]);
}

}
