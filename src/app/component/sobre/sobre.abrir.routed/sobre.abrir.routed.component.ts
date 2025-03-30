import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AlmacenService } from '../../../service/almacen.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartaService } from '../../../service/carta.service';
import { UsuarioService } from '../../../service/usuario.service';

@Component({
  selector: 'app-sobre-abrir',
  templateUrl: './sobre.abrir.routed.component.html',
  styleUrls: ['./sobre.abrir.routed.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class SobreAbrirRoutedComponent implements OnInit, AfterViewInit {
  sobreAbierto: boolean = false;
  cartasReveladas: any[] = [];
  usuarioId!: number;
  mostrarBotonAbrir: boolean = true;
  mostrarModalConfirmacion: boolean = false;
  mostrarModalError: boolean = false;
  mensajeModal: string = '';

  constructor(
    private almacenService: AlmacenService,
    private route: ActivatedRoute,
    private cartaService: CartaService,
    private oRouter: Router,
    private UsuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngAfterViewInit(): void {
    document.querySelector('.btn-open')?.addEventListener('click', () => {
      document.getElementById('pack-opened')?.classList.toggle('open');
    });
  }

  abrirSobre(): void {
    // Limpiar las cartas anteriores
    this.cartasReveladas = [];

    this.sobreAbierto = true;
    this.mostrarBotonAbrir = false;

    this.almacenService.puedeAbrirSobre(this.usuarioId).subscribe({
      next: (puedeAbrir) => {
        if (puedeAbrir) {
          this.procesarApertura(false);
        } else {
          this.mostrarModalConfirmacion = true;
        }
      },
      error: () => {
        this.mostrarMensajeError("Error al verificar si puedes abrir el sobre.");
      },
    });
  }

  mostrarConfirmacionGastarMonedas(): void {
    this.mensajeModal = "Has alcanzado el límite de 2 sobres por día. ¿Quieres gastar 10 monedas para abrir otro sobre?";
    this.mostrarModalConfirmacion = true;
  }

  confirmarUsoMonedas(): void {
    this.mostrarModalConfirmacion = false;
    this.procesarApertura(true);
    this
  }

  procesarApertura(usarMonedas: boolean): void {
    this.almacenService.addCartasAleatorias(this.usuarioId, 5, usarMonedas).subscribe({
      next: (respuesta) => {
        const cartas = Array.isArray(respuesta) ? respuesta as any[] : (respuesta as any)?.cartas as any[];

        if (!Array.isArray(cartas)) {
          this.mostrarMensajeError("Error: Datos de cartas no válidos.");
          return;
        }

        // Esperamos 3 segundos para que termine la animación del sobre
        setTimeout(() => {
          cartas.forEach((carta: any, index: number) => {
            setTimeout(() => {
              this.cartaService.getImage(carta.id).subscribe({
                next: (blob: Blob) => {
                  const imageUrl = URL.createObjectURL(blob);
                  this.cartasReveladas.push({ ...carta, imageUrl });
                },
                error: () => {}
              });
            }, index * 500); // Cada carta aparecerá con 500ms de diferencia
          });

          setTimeout(() => {
            this.mostrarBotonAbrir = true;
          }, cartas.length * 500 + 1000);
        }, 3000); // Esperamos 3 segundos para que termine la animación del sobre
      },
      error: () => {
        this.mostrarMensajeError("No se pudo abrir el sobre.");
      },
    });
  }

  mostrarMensajeError(mensaje: string): void {
    this.mensajeModal = mensaje;
    this.mostrarModalError = true;
  }

  cerrarModal(): void {
    this.mostrarBotonAbrir = true;
    
  }

  verColeccion(idUsuario: number): void {
    this.oRouter.navigate(['usuario/coleccion', idUsuario]);
  }

  flip(event: any): void {
    const element = event.currentTarget;
    element.style.transform =
      element.style.transform === 'rotateY(180deg)'
        ? 'rotateY(0deg)'
        : 'rotateY(180deg)';
  }
}
