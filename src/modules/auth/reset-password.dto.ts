import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Match } from '../user/user-update-password.dto';

export class ResetPasswordDto {
  @IsString({ message: 'New password must be a string' })
  @MinLength(3, { message: 'New password must be at least 3 characters long' })
  @MaxLength(256, {
    message: 'New password must be at most 256 characters long',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{3,256}$/,
    {
      message:
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  newPassword: string;

  @IsString({ message: 'Confirm new password must be a string' })
  @Match('newPassword', {
    message: 'Confirm new password must match new password',
  })
  confirmPassword: string;
}
