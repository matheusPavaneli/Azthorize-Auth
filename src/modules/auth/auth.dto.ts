import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export default class AuthDto {
  @IsString({ message: 'email must be a string' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MinLength(3, { message: 'email must be at least 3 characters long' })
  @MaxLength(256, { message: 'email must be at most 256 characters long' })
  email: string;

  @IsString({ message: 'password must be a string' })
  @MinLength(3, { message: 'password must be at least 3 characters long' })
  @MaxLength(256, { message: 'password must be at most 256 characters long' })
  password: string;
}
