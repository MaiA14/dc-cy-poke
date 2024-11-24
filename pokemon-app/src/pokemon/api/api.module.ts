// pokemon-api.module.ts
import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { FactoryModule } from '../../app.factory';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    FactoryModule.forRoot(),
  ],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
