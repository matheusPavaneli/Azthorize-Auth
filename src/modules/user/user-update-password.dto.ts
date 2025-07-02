import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
  registerDecorator,
  type ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const [relatedPropertyName] = args.constraints;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          return value === (args.object as any)[relatedPropertyName];
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        defaultMessage(_args: ValidationArguments) {
          return `${propertyName} must match ${property}`;
        },
      },
    });
  };
}

export class UserUpdatePasswordDto {
  @IsString({ message: 'Old password must be a string' })
  @MinLength(3, {
    message: 'Old password must be at least 3 characters long',
  })
  @MaxLength(256, {
    message: 'Old password must be at most 256 characters long',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{3,256}$/,
    {
      message:
        'Old password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  oldPassword: string;

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
