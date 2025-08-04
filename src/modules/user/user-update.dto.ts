import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserUpdateDto {
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

  @IsOptional()
  @IsString({ message: 'email must be a string' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MinLength(3, { message: 'email must be at least 3 characters long' })
  @MaxLength(256, { message: 'email must be at most 256 characters long' })
  email: string;

  @IsOptional()
  @IsString({ message: 'password must be a string' })
  @MinLength(3, { message: 'password must be at least 3 characters long' })
  @MaxLength(256, { message: 'password must be at most 256 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{3,256}$/,
    {
      message:
        'password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;
}
