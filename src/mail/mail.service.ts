import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendOtpEmail(email: string, code: string) {
    await this.transporter.sendMail({
      from: `"SalamChat" <${this.configService.get('MAIL_USER')}>`,
      to: email,
      subject: 'Your Verification code ',
      html: `<b>Code: ${code}</b>`,
    });
  }
}
