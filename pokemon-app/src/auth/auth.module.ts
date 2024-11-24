import { DynamicModule, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';  
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { FactoryModule } from '../app.factory';

@Module({})
export class AuthModule {
  static forRoot(): DynamicModule {
    
    const jwtOptions: any = {
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION_TIME
      },
    };
    
    const jwtOptionsProvider: Provider = {
      provide: 'JWT_OPTIONS', 
      useFactory: () => {
        return jwtOptions;
      }
    };
    
    return {
      module: AuthModule,
      imports: [
        ConfigModule,
        FactoryModule.forRoot(),
        PassportModule,
        JwtModule.register(jwtOptions),
        UserModule, 
      ],
      controllers: [AuthController],  
      providers: [jwtOptionsProvider, AuthService, JwtStrategy],
      exports: [AuthService],
    };
  }
}
