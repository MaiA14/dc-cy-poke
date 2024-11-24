import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from '../types/dtos/user.entity'; 
import { IDatabaseService } from 'src/types/database.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('JWT_OPTIONS') private readonly jwtOptions: any, 
    @Inject('DB_SERVICE') private readonly databaseService: IDatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtOptions.secret,  
    });
  }

  async validate(payload: any) {
    let where: any = { id: payload.sub };
    const users: User[] = await this.databaseService.findWithConditions(User, where);
    if (!users) {
      throw new Error('User not found');
    }

    return { 
      userId: payload.sub, 
      username: payload.username, 
      email: payload.email, 
      role: payload.role, 
      phone: payload.phone 
    };
  }
}
