import { Inject, Injectable } from '@nestjs/common';
import { IDatabaseService } from '../types/database.interface';
import { User } from '../types/dtos/user.entity';

@Injectable()
export class UserService {
  constructor(@Inject('DB_SERVICE') private readonly databaseService: IDatabaseService) { }

  async create(userData: Partial<User>): Promise<Partial<User>> {
    return await this.databaseService.create(User, userData);
  }

  async findOneByEmail(email: string): Promise<User> {
    let where: any = { email: email };
    const foundUsers = await this.databaseService.findWithConditions(User, where);
    if (foundUsers) {
      return foundUsers[0];
    } else {
      return null;
    }
  }
}
