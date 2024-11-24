import { Inject, Injectable } from '@nestjs/common';
import { In, Like, Not } from 'typeorm';
import { ApiService } from './api/api.service';
import { Pokemon } from 'src/types/dtos/pokemon.entity';
import { ICacheService } from 'src/types/cache.interface';
import { IDatabaseService } from 'src/types/database.interface';

@Injectable()
export class PokemonService {
  constructor(
    @Inject('CACHE_SERVICE') private readonly cacheService: ICacheService,
    @Inject('DB_SERVICE') private readonly databaseService: IDatabaseService,
    private apiService: ApiService,
  ) {}

  private async addPokemonFromCache(offset: number, limit: number, pokemonList: any[], name?: string, type?: string) {
    const promises = [];
    for (let i = offset; i < offset + limit; i++) {
      promises.push(this.cacheService.get(`pokemon-${i}`));
    }

    const results = await Promise.allSettled(promises);
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        let cachedPokemon = result.value;
        if (typeof cachedPokemon === 'string') {
          cachedPokemon = JSON.parse(cachedPokemon);
        }
        if (cachedPokemon && cachedPokemon.name && cachedPokemon.type) {
          if (name && !cachedPokemon.name.includes(name)) continue;
          if (type && !cachedPokemon.type.includes(type)) continue;
          pokemonList.push(cachedPokemon);
        }
      }
    }
  }

  private async addPokemonFromDatabase(offset: number, limit: number, pokemonList: Pokemon[], name?: string, type?: string) {
    const existingIds = pokemonList.map(p => p.id);
    let where: any = { id: Not(In(existingIds)) };
    if (name) where.name = Like(`%${name}%`);
    if (type) where.type = Like(`%${type}%`);
    const dbPokemons = await this.databaseService.findWithConditions(Pokemon, where);
    let rowCount = 0;
    if (dbPokemons) {
      for (let i = 0; i < limit; i++) {
        if (i < dbPokemons.length) {
          const poke = dbPokemons[i];
          await this.cacheService.set(`pokemon-${poke.id}`, poke);
          pokemonList.push(poke);
          rowCount++;
        }
      }
    }

    return rowCount;
  }


  async getAllPokemon(limit: number, offset: number, name?: string, type?: string) {
    let pokemonList: Pokemon[] = [];

    // step 1: get from cache
    await this.addPokemonFromCache(offset, limit, pokemonList, name, type);
    limit -= pokemonList.length;
    if (limit > 0) {
      const limitFromDB = limit;
      const rowCount = await this.addPokemonFromDatabase(offset, limit, pokemonList, name, type);
      limit -= rowCount;
    }
    
    if (limit > 0) {
      await this.apiService.addPokemonFromAPI(offset, limit, pokemonList, name, type);
    }
    return pokemonList;
  }

  async getPokemonById(id: number): Promise<Pokemon> {
    const pokemon: Pokemon = await this.cacheService.get(`pokemon-${id}`) as Pokemon;
    if (pokemon) {
      return pokemon;
    }
    return this.databaseService.findOne(Pokemon, id);
  }

  async updatePokemon(id: number, updateData: Partial<Pokemon>): Promise<Pokemon> {
    const pokemon: Pokemon = await this.databaseService.update(Pokemon, id, updateData);
    await this.cacheService.set(`pokemon-${id}`, pokemon);
    return pokemon;
  }

  async deletePokemon(id: number): Promise<void> {
    await this.databaseService.delete(Pokemon, id);
    await this.cacheService.del(`pokemon-${id}`);
  }
}
