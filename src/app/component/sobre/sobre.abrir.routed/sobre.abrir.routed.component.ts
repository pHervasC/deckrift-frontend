import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AlmacenService } from '../../../service/almacen.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartaService } from '../../../service/carta.service';

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
  mostrarBotonAbrir: boolean = true; // Controla la visibilidad del botón "Abrir sobre"

  constructor(
    private almacenService: AlmacenService,
    private route: ActivatedRoute,
    private cartaService: CartaService,
    private oRouter: Router
  ) {}

  ngOnInit(): void {
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngAfterViewInit(): void {
    // Simulamos el comportamiento del JavaScript en Angular
    document.querySelector('.btn-open')?.addEventListener('click', () => {
      document.getElementById('pack-opened')?.classList.toggle('open');
    });
  }

  abrirSobre(): void {
    this.sobreAbierto = true;
    this.mostrarBotonAbrir = false; // Oculta el botón de "Abrir sobre"

    // Retrasar la aparición de las cartas para que el sobre desaparezca primero
    setTimeout(() => {
      this.almacenService.addCartasAleatorias(this.usuarioId, 5).subscribe({
        next: (cartas: any[]) => {
          this.cartasReveladas = [];

          // Mostrar cartas una por una con delay
          cartas.forEach((carta: any, index: number) => {
            setTimeout(() => {
              this.cartaService.getImage(carta.id).subscribe({
                next: (blob: Blob) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    this.cartasReveladas.push({
                      ...carta,
                      imageUrl: reader.result as string,
                    });
                  };
                  reader.readAsDataURL(blob);
                },
                error: (error) =>
                  console.error(
                    `Error al obtener imagen de la carta ${carta.id}:`,
                    error
                  ),
              });
            }, index * 500);
          });

          // Mostrar el botón de "Abrir sobre" nuevamente después de que todas las cartas se hayan mostrado
          const totalDelay = cartas.length * 500 + 1000; // Tiempo total de delay (500ms por carta + 1s adicional)
          setTimeout(() => {
            this.mostrarBotonAbrir = true;
            this.sobreAbierto = false; // Restablecer el estado para permitir volver a abrir el sobre
          }, totalDelay);
        },
        error: (err) => console.error('Error al obtener las cartas:', err),
      });
    }, 2000); // Retrasa la aparición de las cartas 2s para que el sobre termine
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
