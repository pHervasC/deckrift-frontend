import { Component, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { IAlmacen } from '../../../model/almacen.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IPage } from '../../../model/model.interface';
import { AlmacenService } from '../../../service/almacen.service';
import { BotoneraService } from '../../../service/botonera.service';
import { CartaService } from '../../../service/carta.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';

@Component({
  selector: 'app-usuario.coleccion.routed',
  templateUrl: './usuario.coleccion.routed.component.html',
  styleUrls: ['./usuario.coleccion.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class UsuarioColeccionRoutedComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  cartaSeleccionada: any = null;
  oPage: IPage<IAlmacen> | null = null;
  usuarioId!: number;
  usuario!: IUsuario;
  nPage: number = 0;
  nRpp: number = 6; // Mostrar 6 cartas por página
  strFiltro: string = '';
  arrBotonera: string[] = [];
  imagenes: { [key: number]: string } = {}; // Almacena imágenes en caché
  cartas: IAlmacen[] = [];
  nombre: string = '';
  isLoading: boolean = false;
  isMobile: boolean = false;
  currentCardIndex: number = 0;
  loadingMore: boolean = false;
  allCardsLoaded: boolean = false;
  currentPage: number = 0;
  pageSize: number = 6;

  private debounceSubject = new Subject<string>();
  readonly dialog = inject(MatDialog);
  oRouter: any;

  constructor(
    private almacenService: AlmacenService,
    private oBotoneraService: BotoneraService,
    private oUsuarioService: UsuarioService,
    private route: ActivatedRoute,
    private oCartaService: CartaService,
  ) {
    // Initialize debounce for search input (300ms delay)
    this.debounceSubject.pipe(debounceTime(300)).subscribe(() => {
      this.goToPage(0);
    });
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 800;
  }

  onContainerScroll(event: Event) {
    if (this.isMobile) {
      const container = event.target as HTMLElement;
      const scrollPosition = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const cardWidth = containerWidth; // cada tarjeta ocupa el ancho completo
      const index = Math.round(scrollPosition / cardWidth);

      if (index >= 0 && this.cartas && index < this.cartas.length) {
        this.currentCardIndex = index;
        
        // Cargar más cartas cuando estamos cerca del final
        if (index >= this.cartas.length - 2 && !this.loadingMore && !this.allCardsLoaded) {
          this.loadMoreCards();
        }
      }
    }
  }

  loadMoreCards() {
    if (this.loadingMore || this.allCardsLoaded) return;
    
    this.loadingMore = true;
    const nextPage = this.nPage + 1;
    
    this.almacenService
      .getCartasPorUsuario(this.usuarioId, nextPage, this.nRpp, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<IAlmacen>) => {
          if (oPageFromServer.content.length === 0) {
            this.allCardsLoaded = true;
          } else {
            // Actualizar el número de página
            this.nPage = nextPage;
            
            // Añadir las nuevas cartas al array existente
            this.cartas = [...this.cartas, ...oPageFromServer.content];
            
            // Actualizar los botones de paginación
            this.arrBotonera = this.oBotoneraService.getBotonera(
              this.nPage,
              oPageFromServer.totalPages
            );
            
            // Cargar imágenes para las nuevas cartas
            oPageFromServer.content.forEach((carta) => {
              this.cargarImagen(carta.carta.id);
            });
          }
          this.loadingMore = false;
        },
        error: (err) => {
          console.error('Error al cargar más cartas:', err);
          this.loadingMore = false;
        }
      });
  }

  scrollToCard(index: number): void {
    if (this.scrollContainer && this.cartas.length > index) {
      this.currentCardIndex = index;
      const containerWidth = this.scrollContainer.nativeElement.clientWidth;
      const scrollPosition = index * containerWidth;

      this.scrollContainer.nativeElement.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }

  getTypeClass(tipo: string): string {
    const tipoNormalizado = this.normalizarTipo(tipo);
    return `type-${tipoNormalizado}`;
  }

  normalizarTipo(tipo: string): string {
    if (!tipo) return 'normal';

    let primerTipo = tipo
      .toLowerCase()
      .split(/[,\/]/)[0]  // Separar por coma o barra
      .trim();

    primerTipo = primerTipo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const tiposMap: { [key: string]: string } = {
      'agua': 'water',
      'fuego': 'fire',
      'planta': 'grass',
      'electrico': 'electric',
      'normal': 'normal',
      'hielo': 'ice',
      'lucha': 'fighting',
      'veneno': 'poison',
      'tierra': 'ground',
      'volador': 'flying',
      'psiquico': 'psychic',
      'bicho': 'bug',
      'roca': 'rock',
      'fantasma': 'ghost',
      'dragon': 'dragon',
      'siniestro': 'dark',
      'acero': 'steel',
      'hada': 'fairy'
    };

    return tiposMap[primerTipo] || primerTipo;
  }

  ngOnInit(): void {
    this.usuarioId = +this.route.snapshot.paramMap.get('id')!;
    this.getone();
    this.getPage();
  }

  getPage(): void {
    this.isLoading = true;
    this.almacenService
      .getCartasPorUsuario(this.usuarioId, this.nPage, this.nRpp, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<IAlmacen>) => {
          this.oPage = oPageFromServer;
          this.cartas = oPageFromServer.content;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
          this.cartas.forEach((carta) => this.cargarImagen(carta.carta.id));
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error al obtener las cartas del usuario:', err);
          this.isLoading = false;
        },
      });
  }

  getone(): void {
    this.oUsuarioService.getOne(this.usuarioId).subscribe({
      next: (usuario: IUsuario) => {
        this.usuario = usuario;
        this.nombre = usuario.nombre;
      }
    })
  }

  cargarImagen(id: number): void {
    if (!this.imagenes[id]) {
      this.oCartaService.getImage(id).subscribe({
        next: (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.imagenes[id] = reader.result as string;
          };
          reader.readAsDataURL(blob);
        },
        error: (err) => {
          console.error(`Error al cargar la imagen de la carta ${id}:`, err);
        },
      });
    }
  }

  goToPage(p: number): void {
    this.nPage = p;
    this.getPage();
  }

  goToNext(): void {
    if (this.oPage && this.nPage + 1 < this.oPage.totalPages) {
      this.nPage++;
      this.getPage();
    }
  }

  goToPrev(): void {
    if (this.nPage > 0) {
      this.nPage--;
      this.getPage();
    }
  }

  // Handle search input with debounce
  onSearchInput(event: Event) {
    this.debounceSubject.next(this.strFiltro);
  }

  // Apply filter immediately when pressing Enter
  applyFilter() {
    this.debounceSubject.next(this.strFiltro);
    this.debounceSubject.complete();
    this.debounceSubject = new Subject<string>();
    this.debounceSubject.pipe(debounceTime(300)).subscribe(() => {
      this.goToPage(0);
    });
  }

  // Keep for backward compatibility
  filter(event: KeyboardEvent) {
    this.applyFilter();
  }

  mostrarPopUp(carta: any): void {
    this.cartaSeleccionada = carta;
  }

  cerrarPopUp(): void {
    this.cartaSeleccionada = null;
  }
}
