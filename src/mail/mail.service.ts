import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendOtpEmail(email: string, code: string) {
    await this.transporter.sendMail({
      from: `"SalamChat" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your Verification code',
      html: `<b>Code: ${code}</b>`,
    });
  }
}
