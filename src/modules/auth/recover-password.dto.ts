import { IsEmail, IsString } from 'class-validator';

export default class RecoverPasswordDto {
  @IsString({ message: 'email must be a string' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;
}
