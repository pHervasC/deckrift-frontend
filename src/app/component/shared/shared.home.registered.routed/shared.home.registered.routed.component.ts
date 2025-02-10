import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IUsuario } from '../../../model/usuario.interface';
import { UsuarioService } from '../../../service/usuario.service';
import { RouterModule } from '@angular/router';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-shared.home.registered.routed',
  templateUrl: './shared.home.registered.routed.component.html',
  styleUrls: ['./shared.home.registered.routed.component.css'],
  standalone: true,
  imports: [RouterModule],
})
export class SharedHomeRegisteredRoutedComponent implements OnInit {
  fotoDni: string | undefined;
  modalImage: string = '';
  strRuta: string = '';
  activeSession: boolean = false;
  userEmail: string = '';
  id: number = 0;

  // Lógica para los sprites
  sprites: string[] = [];
  currentSpriteIndex: number = 0;
  showSprite: boolean = false;

  constructor(
    private oRouter: Router,
    private oSessionService: SessionService,
    private oUsuarioService: UsuarioService
  ) {
    this.oRouter.events.subscribe((oEvent) => {
      if (oEvent instanceof NavigationEnd) {
        this.strRuta = oEvent.url;
      }
    });

    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userEmail = this.oSessionService.getSessionEmail();
      this.oUsuarioService.getUsuarioByEmail(this.userEmail).subscribe({
        next: (data: IUsuario) => {
          this.id = data.id;
        },
      });
    }
  }

  ngOnInit(): void {
    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.activeSession = true;
        this.userEmail = this.oSessionService.getSessionEmail();
      },
    });
    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.userEmail = '';
      },
    });

    // Inicialización de la animación
    this.sprites = [
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/rayquaza.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/rayquaza-mega.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/garchomp.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/garchomp-mega.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/charizard.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/charizard-mega-x.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/charizard-mega-y.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/snorlax-gmax.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/lugia-shadow.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/bulbasaur.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/ivysaur.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/venusaur.png',
      'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/arceus.png',
    ];
    this.animateSprites();
  }

  animateSprites(): void {
    this.showSprite = true;
    setInterval(() => {
      this.showSprite = false; // Ocultar el sprite actual para efecto de transición
      setTimeout(() => {
        this.currentSpriteIndex =
          (this.currentSpriteIndex + 1) % this.sprites.length; // Cambiar al siguiente sprite
        this.showSprite = true;
      }, 300);
    }, 2000); // Cambiar cada 2 segundos
  }

  verColeccion(idUsuario: number): void {
    this.oRouter.navigate(['usuario/coleccion', idUsuario]);
  }
}
