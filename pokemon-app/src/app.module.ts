import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
    AuthModule.forRoot(),
    PokemonModule,
    UserModule,
  ],
})
export class AppModule {}
