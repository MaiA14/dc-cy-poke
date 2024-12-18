import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;  

  @IsEmail()
  @IsNotEmpty()
  email: string;  

  @IsString()
  @IsNotEmpty()
  password: string;  

  @IsString()
  @IsNotEmpty()
  role: string;  

  @IsNotEmpty()
  phone: string;  
}
