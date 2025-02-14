import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Pokemon {
  id: number;
  nombre: string;
  imagen: string;
  tipos: string[];
  altura: number;
  peso: number;
}

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.component.routed.component.html',
  styleUrls: ['./pokedex.component.routed.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PokedexComponent implements OnInit {
  pokemones: Pokemon[] = [];
  pokemonesFiltrados: Pokemon[] = [];
  tiposPokemon: string[] = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting',
    'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost',
    'dark', 'dragon', 'steel', 'fairy'
  ];

  private API_URL = 'https://pokeapi.co/api/v2/pokemon/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPokemones();
  }

  private cargarPokemones(): void {
    const requests = [];

    for (let i = 1; i <= 151; i++) {
      requests.push(this.http.get<any>(`${this.API_URL}${i}`).toPromise());
    }

    Promise.all(requests).then(responses => {
      this.pokemones = responses.map(poke => ({
        id: poke.id,
        nombre: poke.name,
        imagen: poke.sprites.other['official-artwork'].front_default,
        tipos: poke.types.map((t: any) => t.type.name),
        altura: poke.height / 10, // Convertir a metros
        peso: poke.weight / 10 // Convertir a kg
      }));

      this.pokemonesFiltrados = [...this.pokemones]; // Inicialmente muestra todos
    }).catch(error => console.error('Error al cargar Pokémon:', error));
  }

  filtrarPorTipo(tipo: string): void {
    if (tipo === 'all') {
      this.pokemonesFiltrados = [...this.pokemones];
    } else {
      this.pokemonesFiltrados = this.pokemones.filter(poke =>
        poke.tipos.includes(tipo)
      );
    }
  }
}
