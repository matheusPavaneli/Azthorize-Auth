import { IsString, Length } from 'class-validator';

export default class TwoFactorDto {
  @IsString({ message: 'Invalid token' })
  @Length(6, 6, { message: 'Token must be 6 digits' })
  token: string;
}
