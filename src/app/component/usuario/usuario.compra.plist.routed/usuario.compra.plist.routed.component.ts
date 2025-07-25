import { Component, OnInit, Inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { IPage } from '../../../model/model.interface';
import { BotoneraService } from '../../../service/botonera.service';
import { CompraService } from '../../../service/compra.service';
import { SessionService } from '../../../service/session.service';
import { UsuarioService } from '../../../service/usuario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuario-compra-plist-routed',
  templateUrl: './usuario.compra.plist.routed.component.html',
  styleUrls: ['./usuario.compra.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
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
  hasLoaded: boolean = false;
  userId: number | null = null;

  estados = [
    { valor: 'todos', etiqueta: 'Todos' },
    { valor: 'pendiente', etiqueta: 'Pendientes' },
    { valor: 'completado', etiqueta: 'Completados' },
  ];

  constructor(
    @Inject(CompraService) private oCompraService: CompraService,
    @Inject(BotoneraService) private oBotoneraService: BotoneraService,
    @Inject(SessionService) private oSessionService: SessionService,
    @Inject(UsuarioService) private oUsuarioService: UsuarioService,
    private router: Router
  ) {
    // Verificar sesión activa
    if (!this.oSessionService.isSessionActive()) {
      console.error('No hay una sesión activa');
      this.errorMessage = 'Debes iniciar sesión para ver tus compras';
      return;
    }
    
    // Obtener el token y el ID del usuario
    const token = this.oSessionService.getToken();
    if (token) {
      try {
        const tokenData = this.parseJwt(token);
        console.log('Token decodificado:', tokenData);
        
        // Verificar si el token tiene el ID del usuario
        if (tokenData.id) {
          this.userId = tokenData.id;
          console.log('ID de usuario obtenido:', this.userId);
          
          // Cargar la primera página
          this.getPage();
        } else {
          console.error('El token no contiene el ID del usuario');
          this.errorMessage = 'Error al obtener la información del usuario';
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        this.errorMessage = 'Error al procesar la sesión';
      }
    } else {
      console.error('No se encontró el token de autenticación');
      this.errorMessage = 'No se encontró la sesión del usuario';
    }
    
    // Configurar el debounce para la búsqueda
    this.debounceSubject.pipe(debounceTime(1000)).subscribe(() => {
      if (this.userId) {
        this.getPage();
        this.goToPage(1);
      }
    });
  }
  
  // Método para parsear el token JWT
  private parseJwt(token: string): any {
    try {
      // Verificar que el token tenga el formato correcto
      if (!token || typeof token !== 'string') {
        throw new Error('Token no válido');
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('El token no tiene el formato JWT correcto');
      }
      
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Asegurarse de que la cadena base64 sea válida
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const jsonPayload = decodeURIComponent(
        atob(padded)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      console.log('Payload del token:', jsonPayload);
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error al parsear el token JWT:', e);
      throw new Error('Error al procesar el token de autenticación');
    }
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    // Verificar sesión activa
    if (!this.oSessionService.isSessionActive()) {
      console.error('No hay una sesión activa');
      this.errorMessage = 'Debes iniciar sesión para ver tus compras';
      return;
    }
    
    // Obtener el token y el correo del usuario
    const token = this.oSessionService.getToken();
    if (!token) {
      console.error('No se encontró el token de autenticación');
      this.errorMessage = 'No se encontró la sesión del usuario';
      return;
    }

    try {
      const tokenData = this.parseJwt(token);
      console.log('Token decodificado:', tokenData);
      
      // Obtener el ID del usuario usando el correo del token
      if (tokenData.correo) {
        this.oUsuarioService.getUsuarioByEmail(tokenData.correo).subscribe({
          next: (usuario: any) => {
            if (usuario && usuario.id) {
              this.userId = usuario.id;
              console.log('ID de usuario obtenido:', this.userId);
              this.getPage();
            } else {
              console.error('No se pudo obtener el ID del usuario');
              this.errorMessage = 'Error al obtener la información del usuario';
            }
          },
          error: (err: any) => {
            console.error('Error al obtener el usuario por correo:', err);
            this.errorMessage = 'Error al cargar la información del usuario';
          }
        });
      } else {
        console.error('El token no contiene el correo del usuario');
        this.errorMessage = 'Error al procesar la sesión del usuario';
      }
    } catch (error) {
      console.error('Error al procesar el token:', error);
      this.errorMessage = 'Error al procesar la sesión';
    }
  }

  getPage() {
    console.log('Iniciando getPage()');
    this.errorMessage = null;
    this.hasLoaded = false;
    
    // Verificar que tenemos un userId válido
    if (!this.userId) {
      console.error('No se pudo obtener el ID del usuario');
      this.errorMessage = 'No se pudo cargar la información del usuario';
      this.isLoading = false;
      this.hasLoaded = true;
      return;
    }
    
    this.isLoading = true;
    
    console.log(`Obteniendo compras para el usuario ID: ${this.userId}`);
    console.log(`Parámetros: página=${this.nPage}, tamaño=${this.nRpp}, orden=${this.strField}, dirección=${this.strDir}, filtro=${this.strFiltro}, estado=${this.estadoSeleccionado}`);
    
    // Verificar si hay un token válido
    const token = this.oSessionService.getToken();
    if (!token) {
      console.error('No se encontró el token de autenticación');
      this.errorMessage = 'No se encontró la sesión del usuario. Por favor, inicia sesión nuevamente.';
      this.isLoading = false;
      this.hasLoaded = true;
      return;
    }
    
    // Llamar al servicio para obtener las compras del usuario
    this.oCompraService
      .getPageByUsuario(this.userId, this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro, this.estadoSeleccionado)
      .subscribe({
        next: (oPageFromServer: IPage<any>) => {
          console.log('Respuesta del servidor (compras del usuario):', oPageFromServer);
          
          // Verificar que la respuesta tenga contenido
          if (!oPageFromServer || !oPageFromServer.content) {
            console.warn('El servidor no devolvió compras');
            this.compras = [];
            this.oPage = {
              content: [],
              pageable: {
                pageNumber: this.nPage,
                pageSize: this.nRpp,
                sort: { empty: true, sorted: false, unsorted: true },
                offset: this.nPage * this.nRpp,
                paged: true,
                unpaged: false
              },
              totalPages: 0,
              totalElements: 0,
              last: true,
              size: this.nRpp,
              number: this.nPage,
              sort: { empty: true, sorted: false, unsorted: true },
              first: true,
              numberOfElements: 0,
              empty: true
            };
          } else {
            this.oPage = oPageFromServer;
            this.compras = oPageFromServer.content;
            console.log(`Compras cargadas: ${this.compras.length} registros`);
            
            // Actualizar la paginación
            this.arrBotonera = this.oBotoneraService.getBotonera(
              this.nPage,
              oPageFromServer.totalPages
            );
          }
          this.isLoading = false;
          this.hasLoaded = true;
        },
        error: (err: any) => {
          console.error('Error al cargar las compras:', err);
          this.errorMessage = 'Error al cargar las compras. Por favor, inténtalo de nuevo más tarde.';
          
          // Manejar diferentes códigos de error
          if (err.status === 401) {
            this.errorMessage = 'No estás autorizado para ver estas compras. Por favor, inicia sesión nuevamente.';
          } else if (err.status === 404) {
            this.errorMessage = 'No se encontraron compras para este usuario.';
          } else if (err.status === 0) {
            this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a Internet.';
          }
          
          // Inicializar variables para evitar errores en la vista
          this.compras = [];
          this.oPage = {
            content: [],
            pageable: {
              pageNumber: this.nPage,
              pageSize: this.nRpp,
              sort: { empty: true, sorted: false, unsorted: true },
              offset: this.nPage * this.nRpp,
              paged: true,
              unpaged: false
            },
            totalPages: 0,
            totalElements: 0,
            last: true,
            size: this.nRpp,
            number: this.nPage,
            sort: { empty: true, sorted: false, unsorted: true },
            first: true,
            numberOfElements: 0,
            empty: true
          };
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

  // Navegar a la tienda
  navigateToShop(): void {
    // Verificar si el usuario está autenticado
    if (!this.oSessionService.isSessionActive()) {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/login']);
    } else {
      // Si está autenticado, intentar navegar a la tienda
      // La verificación de permisos se manejará en el guardia de ruta
      this.router.navigate(['/shop']).catch(error => {
        console.error('Error al navegar a la tienda:', error);
        // En caso de error (como falta de permisos), redirigir a la página de inicio
        this.router.navigate(['/home/registered']);
      });
    }
  }
}
