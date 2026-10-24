import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export class ConfirmEmailDto {
  @IsEmail({}, { message: 'Enter a valid email.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Enter the code from your email.' })
  otp!: string;
}

export class SignInDto {
  @IsEmail({}, { message: 'Enter a valid email.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Enter your password.' })
  password!: string;
}

@ValidatorConstraint({ name: 'passwordsMatch', async: false })
class PasswordsMatch implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const dto = args.object as SignUpDto;
    return confirmPassword === dto.password;
  }

  defaultMessage() {
    return 'Passwords do not match.';
  }
}

export class SignUpDto {
  @IsString()
  @IsNotEmpty({ message: 'Enter your full name.' })
  fullName!: string;

  @IsEmail({}, { message: 'Enter a valid email.' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Use at least 8 characters.' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirm your password.' })
  @Validate(PasswordsMatch)
  confirmPassword!: string;
}
