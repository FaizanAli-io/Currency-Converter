import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      otp,
      otpExpiry,
    });

    // Send OTP via email
    try {
      await this.emailService.sendOtpEmail(user.email, otp, user.name);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // Still allow registration to succeed even if email fails
      console.log(`OTP for ${user.email}: ${otp}`);
    }

    return {
      message: 'Registration successful. Please verify your email with OTP.',
      email: user.email,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(verifyOtpDto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.otp !== verifyOtpDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      throw new BadRequestException('OTP has expired');
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      otp: undefined,
      otpExpiry: undefined,
    });

    return { message: 'Email verified successfully' };
  }

  async resendOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.usersService.update(user.id, { otp, otpExpiry });

    // Send OTP via email
    try {
      await this.emailService.sendOtpEmail(user.email, otp, user.name);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      console.log(`New OTP for ${user.email}: ${otp}`);
      throw new BadRequestException('Failed to send OTP email');
    }

    return { message: 'OTP sent successfully' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = this.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersService.update(user.id, { resetToken, resetTokenExpiry });

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      console.log(`Reset token for ${user.email}: ${resetToken}`);
      // Don't throw error to avoid revealing if email exists
    }

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(
      resetPasswordDto.token,
    );
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      throw new BadRequestException('Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpiry: undefined,
    });

    return { message: 'Password reset successful' };
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
