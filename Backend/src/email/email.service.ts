import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      port: 587,
      secure: false,
      host: 'smtp.gmail.com',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendOtpEmail(email: string, otp: string, name?: string): Promise<void> {
    const fromName = 'Currency Converter';
    const fromEmail = this.configService.get<string>('SMTP_USER');

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Your Currency Converter OTP Code',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #3b82f6, #06b6d4);
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .content {
                  background: #f8f9fa;
                  padding: 30px;
                  border-radius: 0 0 10px 10px;
                }
                .otp-box {
                  background: white;
                  border: 2px dashed #3b82f6;
                  border-radius: 8px;
                  padding: 20px;
                  text-align: center;
                  margin: 20px 0;
                }
                .otp-code {
                  font-size: 32px;
                  font-weight: bold;
                  color: #3b82f6;
                  letter-spacing: 5px;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🔐 Email Verification</h1>
              </div>
              <div class="content">
                <p>Hello${name ? ' ' + name : ''},</p>
                <p>Thank you for registering with Currency Converter! To complete your registration, please use the following One-Time Password (OTP):</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                
                <p><strong>This OTP will expire in 10 minutes.</strong></p>
                <p>If you didn't request this code, please ignore this email.</p>
                
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Currency Converter. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Hello${name ? ' ' + name : ''},\n\nYour OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      });

      this.logger.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    name?: string,
  ): Promise<void> {
    const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL');
    const fromName = this.configService.get<string>('SMTP_FROM_NAME');
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Password Reset Request - Currency Converter',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #3b82f6, #06b6d4);
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .content {
                  background: #f8f9fa;
                  padding: 30px;
                  border-radius: 0 0 10px 10px;
                }
                .token-box {
                  background: white;
                  border: 2px solid #3b82f6;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 20px 0;
                  word-break: break-all;
                }
                .token-code {
                  font-family: monospace;
                  font-size: 14px;
                  color: #3b82f6;
                  font-weight: bold;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🔒 Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello${name ? ' ' + name : ''},</p>
                <p>We received a request to reset your password. Use the following reset token:</p>
                
                <div class="token-box">
                  <div class="token-code">${resetToken}</div>
                </div>
                
                <p><strong>This token will expire in 1 hour.</strong></p>
                <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Currency Converter. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Hello${name ? ' ' + name : ''},\n\nYour password reset token is: ${resetToken}\n\nThis token will expire in 1 hour.\n\nIf you didn't request this password reset, please ignore this email.`,
      });

      this.logger.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error,
      );
      throw new Error('Failed to send email');
    }
  }
}
