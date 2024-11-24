import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../types/dtos/user.entity';
import { LoginDto } from './dto/login.dto';
import { IDatabaseService } from 'src/types/database.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, 
    @Inject('DB_SERVICE') private readonly databaseService: IDatabaseService) { }

  async register(createUserDto: CreateUserDto): Promise<any> {
    const { name, email, password, role, phone } = createUserDto;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.databaseService.create(User, {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
    });

    return {
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    let where: any = { email: email };
    const users: User[] = await this.databaseService.findWithConditions(User, where);
    if (!users) {
      throw new Error('Invalid credentials');
    }

    const user: User = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      access_token: token,
    };
  }
}
