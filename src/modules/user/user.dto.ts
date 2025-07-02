import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserDto {
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  @MaxLength(100, { message: 'name must be at most 100 characters long' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'username must be a string' })
  @MinLength(3, { message: 'username must be at least 3 characters long' })
  @MaxLength(32, { message: 'username must be at most 32 characters long' })
  username?: string;

  @IsString({ message: 'email must be a string' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MinLength(3, { message: 'email must be at least 3 characters long' })
  @MaxLength(256, { message: 'email must be at most 256 characters long' })
  email: string;
}
