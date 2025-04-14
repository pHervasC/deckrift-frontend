import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionService } from '../../../service/session.service';
import { UsuarioService } from '../../../service/usuario.service';
import { IUsuario } from '../../../model/usuario.interface';

@Component({
  selector: 'app-shared-home-registered-routed',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './shared.home.registered.routed.component.html',
  styleUrls: ['./shared.home.registered.routed.component.css']
})
export class SharedHomeRegisteredRoutedComponent implements OnInit, OnDestroy {

  id: number = 0;
  user: IUsuario | null = null;
  status: HttpErrorResponse | null = null;
  
  // Sprite animation logic
  sprites: string[] = [];
  currentSpriteIndex: number = 0;
  showSprite: boolean = false;
  spriteInterval: any;

  constructor(
    private oSessionService: SessionService,
    private oUsuarioService: UsuarioService,
    private oRouter: Router
  ) { }

  ngOnInit() {
    this.getUser();
    
    // Initialize sprite animation
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

  ngOnDestroy() {
    // Clean up interval when component is destroyed
    if (this.spriteInterval) {
      clearInterval(this.spriteInterval);
    }
  }

  getUser(): void {
    const email = this.oSessionService.getSessionEmail();
    if (email) {
      this.oUsuarioService.getUsuarioByEmail(email)
        .subscribe({
          next: (data: IUsuario) => {
            this.user = data;
            if (this.user) {
              this.id = this.user.id;
            }
          },
          error: (error: HttpErrorResponse) => {
            this.status = error;
            this.oRouter.navigate(['/login']);
          }
        });
    } else {
      this.oRouter.navigate(['/login']);
    }
  }
  
  animateSprites(): void {
    this.showSprite = true;
    this.spriteInterval = setInterval(() => {
      this.showSprite = false; // Hide current sprite for transition effect
      setTimeout(() => {
        this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.sprites.length; // Change to next sprite
        this.showSprite = true;
      }, 300);
    }, 2000); // Change every 2 seconds
  }

  logout() {
    this.oSessionService.logout();
    this.oRouter.navigate(['/login']);
  }

  goToCollection() {
    this.oRouter.navigate(['/usuario/coleccion', this.id]);
  }

  goToPokedex() {
    this.oRouter.navigate(['/pokedex']);
  }

  goToCards() {
    window.location.href = 'https://www.deckrift.com/cartas/plist';
  }

  goToOpenPacks() {
    this.oRouter.navigate(['/sobre/abrir', this.id]);
  }
}
