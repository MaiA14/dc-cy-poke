import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsString, IsNotEmpty, IsEmail, MinLength, IsEnum } from 'class-validator';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string; 

  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  role: string;

  @Column()
  @IsNotEmpty()
  phone: string;
}
