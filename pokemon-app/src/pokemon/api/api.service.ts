import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Pokemon } from '../../types/dtos/pokemon.entity';
import { ICacheService } from '../../types/cache.interface';
import { IDatabaseService } from '../../types/database.interface';

@Injectable()
export class ApiService {
  private apiUrl = 'https://pokeapi.co/api/v2/';

  constructor(
    @Inject('CACHE_SERVICE') private readonly cacheService: ICacheService, 
    @Inject('DB_SERVICE') private databaseService: IDatabaseService) { }

  async addPokemonFromAPI(offset: number, limit: number, pokemonList: Pokemon[], name?: string, type?: string) {
    const apiPokemonData = await this.fetchPokemonDataFromAPI(limit, offset + pokemonList.length);
    for (const poke of apiPokemonData) {
      try {
        if (name && !poke.name.includes(name)) continue;
        if (type && !poke.types.some((t: any) => t.type.name.includes(type))) continue;

        pokemonList.push(poke);
      } catch (error) {
        console.error('Error interacting with Redis during addPokemonFromAPI:', error);
      }
    }
  }

  private async fetchPokemonDataFromAPI(limit: number, offset: number) {
    try {
      const pokemonData = await this.fetchPokemonListFromAPI(limit, offset);
      const savedPokemons = await this.processPokemonDetails(pokemonData);
      return savedPokemons;
    } catch (error) {
      console.error('Error fetching Pokémon data from API:', error);
      throw error;
    }
  }

  private async fetchPokemonListFromAPI(limit: number, offset: number) {
    try {
      const response = await axios.get(`${this.apiUrl}pokemon?limit=${limit}&offset=${offset}`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching Pokémon list from API:', error);
      throw error;
    }
  }

  private async processPokemonDetails(pokemonData: any[]) {
    const savedPokemons = [];
    for (const poke of pokemonData) {
      try {
        const pokeDetails = await axios.get(poke.url);
        const { id, name, types, sprites } = pokeDetails.data;
        const image = sprites?.front_default || 'default-image-url';
        const type = types.map(t => t.type.name).join(', ');

        const existingPokemon = await this.databaseService.findOne(Pokemon, id);
        if (!existingPokemon) {
          const savedPokemon = await this.databaseService.create(Pokemon, {
            id,
            name,
            type,
            image,
          });

          await this.cacheService.set(`pokemon-${id}`, savedPokemon);
          savedPokemons.push(savedPokemon);
        }
      } catch (error) {
        console.error('Error fetching Pokémon details from API:', error);
        throw error;
      }
    }
    return savedPokemons;
  }
}
