import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'SecurePassword123',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: true,
  })
  @IsNotEmpty()
  name: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123',
  })
  @IsNotEmpty()
  password: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'OTP code sent to user email',
    example: '123456',
  })
  @IsNotEmpty()
  otp: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address for password reset',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from email',
    example: 'reset_token_here',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'NewSecurePassword123',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class ResendOtpDto {
  @ApiProperty({
    description: 'User email address to resend OTP to',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
