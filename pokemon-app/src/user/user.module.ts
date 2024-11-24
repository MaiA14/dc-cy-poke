import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { FactoryModule } from '../app.factory';

@Module({
  imports: [
    FactoryModule.forRoot(),
  ],
  providers: [UserService],
  exports: [UserService], 
})
export class UserModule {}
