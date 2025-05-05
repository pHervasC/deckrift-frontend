import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ICarta } from '../../../model/carta.interface';
import { debounceTime, Subject } from 'rxjs';
import { IPage } from '../../../model/model.interface';
import { BotoneraService } from '../../../service/botonera.service';
import { Router, RouterModule } from '@angular/router';
import { CartaService } from '../../../service/carta.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carta.plist.routed',
  templateUrl: './carta.plist.routed.component.html',
  styleUrls: ['./carta.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class CartaPlistRoutedComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  oPage: IPage<ICarta> | null = null;
  nPage: number = 0;
  nRpp: number = 6;
  strField: string = '';
  strDir: string = 'desc';
  strFiltro: string = '';
  arrBotonera: string[] = [];
  imagenes: { [key: number]: string } = {};
  isLoading: boolean = false;
  isMobile: boolean = false;
  currentCardIndex: number = 0;
  mobileCards: ICarta[] = [];
  loadingMore: boolean = false;
  allCardsLoaded: boolean = false;
  currentPage: number = 0;
  pageSize: number = 6;

  private debounceSubject = new Subject<string>();

  constructor(
    private oCartaService: CartaService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router
  ) {
    this.debounceSubject.pipe(debounceTime(1000)).subscribe(() => {
      this.resetPagination();
      this.getPage();
    });
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  onContainerScroll(event: Event) {
    if (this.isMobile) {
      const container = event.target as HTMLElement;
      const scrollPosition = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const cardWidth = containerWidth;
      const index = Math.round(scrollPosition / cardWidth);

      if (index >= 0 && this.mobileCards && index < this.mobileCards.length) {
        this.currentCardIndex = index;

        // Check if we're near the end of the current loaded cards
        if (index >= this.mobileCards.length - 2 && !this.loadingMore && !this.allCardsLoaded) {
          this.loadMoreCards();
        }
      }
    }
  }

  // Método para cargar más cartas en la vista móvil
  loadMoreCards() {
    if (this.loadingMore || this.allCardsLoaded) return;

    this.loadingMore = true;
    this.currentPage++;

    this.oCartaService
      .getPage(this.currentPage, this.pageSize, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<ICarta>) => {
          if (oPageFromServer.content.length === 0) {
            this.allCardsLoaded = true;
          } else {
            // Agregar nuevas cartas al array de cartas móviles
            const newCards = [...oPageFromServer.content];
            this.mobileCards = [...this.mobileCards, ...newCards];

            // Cargar imágenes para las nuevas cartas
            newCards.forEach((carta) => {
              this.cargarImagenCarta(carta);
            });

            // Asegurar que el renderizado se complete antes de quitar el indicador de carga
            setTimeout(() => {
              this.loadingMore = false;
            }, 500);
          }
        },
        error: (err) => {
          console.error('Error al cargar más cartas:', err);
          this.loadingMore = false;
        }
      });
  }

  // Método para cargar la imagen de una carta específica
  cargarImagenCarta(carta: ICarta) {
    // Verificar si ya se ha intentado cargar la imagen anteriormente
    if (this.imagenes[carta.id] === undefined) {
      this.oCartaService.getImage(carta.id).subscribe({
        next: (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.imagenes[carta.id] = reader.result as string;
          };
          reader.onerror = () => {
            console.error(`Error al procesar la imagen de la carta ${carta.id}`);
            this.imagenes[carta.id] = ''; // Marcar como intentada pero fallida
          };
          reader.readAsDataURL(blob);
        },
        error: (err) => {
          console.error(`Error al cargar la imagen de la carta ${carta.id}:`, err);
          this.imagenes[carta.id] = ''; // Marcar como intentada pero fallida
        }
      });
    }
  }

  resetPagination() {
    this.nPage = 0;
    this.currentPage = 0;
    this.mobileCards = [];
    this.allCardsLoaded = false;
  }

  checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 800;

    // Solo recargar si el modo ha cambiado
    if (wasMobile !== this.isMobile) {
      this.resetPagination();
      this.getPage();
    }
  }

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    this.isLoading = true;

    if (this.isMobile) {
      // Para móvil, cargar la primera página de cartas
      this.oCartaService
        .getPage(this.currentPage, this.pageSize, this.strField, this.strDir, this.strFiltro)
        .subscribe({
          next: (oPageFromServer: IPage<ICarta>) => {
            this.mobileCards = oPageFromServer.content;
            this.cargarImagenes(oPageFromServer.content);
            this.isLoading = false;
            this.allCardsLoaded = oPageFromServer.content.length < this.pageSize;
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
          },
        });
    } else {
      // Para escritorio, usar paginación
      this.oCartaService
        .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
        .subscribe({
          next: (oPageFromServer: IPage<ICarta>) => {
            this.oPage = oPageFromServer;
            this.arrBotonera = this.oBotoneraService.getBotonera(
              this.nPage,
              oPageFromServer.totalPages
            );
            this.cargarImagenes(oPageFromServer.content);
            this.isLoading = false;
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
          },
        });
    }
  }

  cargarImagenes(cartas: ICarta[]) {
    if (cartas) {
      cartas.forEach((carta) => {
        this.cargarImagenCarta(carta);
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
      .split(/[,\/]/)[0]
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

  getTypeElements(tipo: string): string {
    const tipoNormalizado = this.normalizarTipo(tipo);

    switch(tipoNormalizado) {
      case 'water': return 'elements-water';
      case 'fire': return 'elements-fire';
      case 'grass': return 'elements-grass';
      case 'rock': return 'elements-rock';
      case 'ground': return 'elements-rock';
      case 'ghost': return 'elements-ghost';
      case 'electric': return 'elements-electric';
      case 'flying': return 'elements-flying';
      case 'dragon': return 'elements-dragon';
      default: return '';
    }
  }

  goToPage(p: number) {
    if (p) {
      this.nPage = p - 1;
      this.getPage();
    }
    return false;
  }

  goToNext() {
    this.nPage++;
    this.getPage();
    return false;
  }

  goToPrev() {
    this.nPage--;
    this.getPage();
    return false;
  }

  sort(field: string) {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage();
  }

  goToRpp(nrpp: number) {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  filter(event: any) {
    this.isLoading = true;
    this.debounceSubject.next(this.strFiltro);
  }

  scrollToCard(index: number): void {
    if (this.scrollContainer && this.mobileCards.length > index) {
      this.currentCardIndex = index;
      const containerWidth = this.scrollContainer.nativeElement.clientWidth;
      const scrollPosition = index * containerWidth;

      this.scrollContainer.nativeElement.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }
}
