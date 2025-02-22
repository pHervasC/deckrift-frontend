import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Pokedex from 'pokedex-promise-v2';

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
  imports: [
    CommonModule
  ],
})
export class PokedexComponent implements OnInit {
  private pokedex = new Pokedex(); // Instancia de la API de Pokedex
  pokemones: Pokemon[] = [];
  pokemonesFiltrados: Pokemon[] = [];
  tiposPokemon: string[] = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting',
    'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost',
    'dark', 'dragon', 'steel', 'fairy'
  ];

  ngOnInit(): void {
    this.cargarPokemones();
  }

  private async cargarPokemones(): Promise<void> {
    try {
      const ids = Array.from({ length: 151 }, (_, i) => i + 1); // Genera un array con IDs del 1 al 151
      const responses = await this.pokedex.getPokemonByName(ids);

      this.pokemones = responses.map((poke: any) => ({
        id: poke.id,
        nombre: poke.name,
        imagen: poke.sprites.other['official-artwork'].front_default,
        tipos: poke.types.map((t: any) => t.type.name),
        altura: poke.height / 10,
        peso: poke.weight / 10,
      }));

      this.pokemonesFiltrados = [...this.pokemones];
    } catch (error) {
      console.error('Error al cargar Pokémon:', error);
    }
  }

  filtrarPorTipo(tipo: string): void {
    this.pokemonesFiltrados = tipo === 'all' 
      ? [...this.pokemones] 
      : this.pokemones.filter(poke => poke.tipos.includes(tipo));
  }
}
