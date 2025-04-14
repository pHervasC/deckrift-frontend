import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AlmacenService } from '../../../service/almacen.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartaService } from '../../../service/carta.service';
import { UsuarioService } from '../../../service/usuario.service';
import { MonedaService } from '../../../service/moneda.service';

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
  mostrarBotonTienda: boolean = false;
  mensajeModal: string = '';

  constructor(
    private almacenService: AlmacenService,
    private route: ActivatedRoute,
    private cartaService: CartaService,
    private oRouter: Router,
    private UsuarioService: UsuarioService,
    private monedaService: MonedaService
  ) {}

  ngOnInit(): void {
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngAfterViewInit(): void {
    // No need for additional event listeners
  }

  abrirSobre(): void {
    // Limpiar las cartas anteriores
    this.cartasReveladas = [];
    
    // Primero verificar si puede abrir el sobre sin mostrar la animación todavía
    this.mostrarBotonAbrir = false;
    
    this.almacenService.puedeAbrirSobre(this.usuarioId).subscribe({
      next: (puedeAbrir) => {
        if (puedeAbrir) {
          // Si puede abrir, ahora sí mostramos la animación
          this.mostrarAnimacionSobre();
          this.procesarApertura(false);
        } else {
          // Si no puede abrir, mostrar el modal de confirmación (sin animación aún)
          this.mostrarModalConfirmacion = true;
        }
      },
      error: () => {
        this.mostrarMensajeError("Error al verificar si puedes abrir el sobre.");
        this.mostrarBotonAbrir = true; // Restaurar el botón en caso de error
      },
    });
  }

  // Método separado para mostrar la animación del sobre
  mostrarAnimacionSobre(): void {
    this.sobreAbierto = true;
    
    // Agregar la clase 'open' directamente al elemento para asegurar que la animación se ejecute
    setTimeout(() => {
      const packElement = document.getElementById('pack-opened');
      if (packElement) {
        // Asegurarse de que la clase 'open' se quite y luego se agregue de nuevo
        packElement.classList.remove('open');
        
        // Pequeña pausa y luego agregar la clase 'open' de nuevo
        setTimeout(() => {
          packElement.classList.add('open');
        }, 10);
      }
    }, 0);
  }

  mostrarConfirmacionGastarMonedas(): void {
    this.mensajeModal = "Has alcanzado el límite de 2 sobres por día. ¿Quieres gastar 10 monedas para abrir otro sobre?";
    this.mostrarModalConfirmacion = true;
  }

  confirmarUsoMonedas(): void {
    this.mostrarModalConfirmacion = false;
    
    // Ahora sí mostramos la animación del sobre al confirmar el uso de monedas
    this.mostrarAnimacionSobre();
    
    this.procesarApertura(true);
  }

  procesarApertura(usarMonedas: boolean): void {
    this.almacenService.addCartasAleatorias(this.usuarioId, 5, usarMonedas).subscribe({
      next: (respuesta) => {
        const cartas = Array.isArray(respuesta) ? respuesta as any[] : (respuesta as any)?.cartas as any[];

        if (!Array.isArray(cartas)) {
          this.mostrarMensajeError("Error: Datos de cartas no válidos.");
          return;
        }

        if (usarMonedas) {
          this.UsuarioService.getOne(this.usuarioId).subscribe({
            next: (usuario) => {
              this.monedaService.setMonedas(usuario.monedas);
            }
          });
        }
        // Procesamos las cartas inmediatamente sin esperar la animación del sobre
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
        }, cartas.length * 500);
      },
      error: (error) => {
        const mensaje = error.error?.error || "No se pudo abrir el sobre.";
        this.mostrarMensajeError(mensaje);
      },
    });
  }

  mostrarMensajeError(mensaje: string): void {
    this.mensajeModal = mensaje;
    this.mostrarModalError = true;
    // Determinar si el error es por falta de monedas
    this.mostrarBotonTienda = mensaje.toLowerCase().includes('monedas') ||
                             mensaje.toLowerCase().includes('saldo') ||
                             mensaje.toLowerCase().includes('insuficiente');
  }

  cerrarModal(): void {
    this.mostrarBotonAbrir = true;
    this.mostrarModalConfirmacion = false;
    this.mostrarModalError = false;
  }

  verColeccion(idUsuario: number): void {
    this.oRouter.navigate(['usuario/coleccion', idUsuario]);
  }

  irATienda(): void {
    this.oRouter.navigate(['shop']);
  }

  flip(event: any): void {
    const element = event.currentTarget;
    element.style.transform =
      element.style.transform === 'rotateY(180deg)'
        ? 'rotateY(0deg)'
        : 'rotateY(180deg)';
  }
}
