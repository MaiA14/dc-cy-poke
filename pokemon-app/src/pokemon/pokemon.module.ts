import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { ApiModule } from './api/api.module';
import { FactoryModule } from 'src/app.factory';

@Module({
  imports: [
    FactoryModule.forRoot(),
    ApiModule
  ],
  providers: [PokemonService, PokemonController],
  controllers: [PokemonController],
})
export class PokemonModule {}
