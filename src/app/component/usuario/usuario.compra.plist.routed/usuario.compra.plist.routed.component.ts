import { Component, OnInit, Inject } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { IPage } from '../../../model/model.interface';
import { BotoneraService } from '../../../service/botonera.service';
import { CompraService } from '../../../service/compra.service';
import { SessionService } from '../../../service/session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuario-compra-plist-routed',
  templateUrl: './usuario.compra.plist.routed.component.html',
  styleUrls: ['./usuario.compra.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UsuarioCompraPlistRoutedComponent implements OnInit {
  // Hacer disponibles Math y parseInt en la plantilla
  Math = Math;
  parseInt = parseInt;
  
  oPage: IPage<any> | null = null;
  errorMessage: string | null = null;
  nPage: number = 0;
  nRpp: number = 10;
  strField: string = '';
  strDir: string = 'desc';
  strFiltro: string = '';
  estadoSeleccionado: string = 'todos';
  compras: any[] = [];
  arrBotonera: string[] = [];
  private debounceSubject = new Subject<string>();
  isLoading: boolean = false;
  userId: number | null = null;

  estados = [
    { valor: 'todos', etiqueta: 'Todos' },
    { valor: 'pendiente', etiqueta: 'Pendientes' },
    { valor: 'completado', etiqueta: 'Completados' },
  ];

  constructor(
    @Inject(CompraService) private oCompraService: CompraService,
    @Inject(BotoneraService) private oBotoneraService: BotoneraService,
    @Inject(SessionService) private oSessionService: SessionService
  ) {
    // Obtener el ID del usuario desde el token JWT
    const token = this.oSessionService.getToken();
    if (token) {
      const tokenData = this.parseJwt(token);
      this.userId = tokenData.id;
    }
    
    this.debounceSubject.pipe(debounceTime(1000)).subscribe(() => {
      this.getPage();
      this.goToPage(1);
    });
  }
  
  // Método para parsear el token JWT
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error al parsear el token JWT:', e);
      return null;
    }
  }

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    console.log('Iniciando getPage()');
    if (!this.userId) {
      console.error('No se pudo obtener el ID del usuario');
      return;
    }
    
    console.log('ID de usuario:', this.userId);
    const estado = this.estadoSeleccionado !== 'todos' ? this.estadoSeleccionado : undefined;
    console.log('Parámetros de búsqueda:', { 
      page: this.nPage, 
      size: this.nRpp, 
      field: this.strField, 
      dir: this.strDir, 
      filtro: this.strFiltro,
      estado: estado 
    });
    
    this.isLoading = true;
    
    this.oCompraService
      .getPageByUsuario(this.userId, this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro, estado)
      .subscribe({
        next: (oPageFromServer: IPage<any>) => {
          console.log('Respuesta del servidor:', oPageFromServer);
          this.oPage = oPageFromServer;
          this.compras = oPageFromServer.content || [];
          console.log('Compras cargadas:', this.compras);
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error al cargar las compras:', err);
          this.errorMessage = 'Error al cargar las compras. Por favor, inténtalo de nuevo más tarde.';
          if (err.status === 401) {
            this.errorMessage = 'No estás autorizado para ver estas compras. Por favor, inicia sesión nuevamente.';
          } else if (err.status === 404) {
            this.errorMessage = 'No se encontraron compras para este usuario.';
          }
          this.isLoading = false;
        },
      });
  }

  onFilter(event: any) {
    this.debounceSubject.next(event);
  }

  cambiarEstado(event: any) {
    this.estadoSeleccionado = event.target.value;
    this.getPage();
    this.goToPage(1);
  }

  goToPage(page: number) {
    this.nPage = page - 1;
    this.getPage();
  }

  changeRpp(rpp: number) {
    this.nRpp = rpp;
    this.goToPage(1);
  }

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
