import { Controller, Get, Param, Body, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Pokemon } from '../types/dtos/pokemon.entity';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  async getAllPokemon(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
    @Query('name') name?: string, 
    @Query('type') type?: string, 
  ) {
    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    if (isNaN(parsedLimit)) {
      return { error: 'Invalid limit value' };
    }
    if (isNaN(parsedOffset)) {
      return { error: 'Invalid offset value' };
    }

    return await this.pokemonService.getAllPokemon(parsedLimit, parsedOffset, name, type);
  }

  @Get(':id')
  async getPokemonById(@Param('id') id: number) {
    return await this.pokemonService.getPokemonById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePokemon(
    @Param('id') id: number,
    @Body() updateData: Partial<Pokemon>,
  ) {
    return await this.pokemonService.updatePokemon(id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePokemon(@Param('id') id: number) {
    await this.pokemonService.deletePokemon(id);
    return { message: 'Pokémon deleted successfully' };
  }
}