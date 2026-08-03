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
      subject: 'Your Verification Code',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background-color: #f9fafb; border-radius: 12px;">
        <h2 style="color: #1f2937; margin-bottom: 8px;">SalamChat</h2>
        <p style="color: #4b5563; font-size: 15px;">Doğrulama kodun:</p>
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
        </div>
        <p style="color: #9ca3af; font-size: 13px;">Bu kod 2 dakika içinde geçerliliğini yitirecek. Eğer bu isteği sen yapmadıysan, bu emaili görmezden gelebilirsin.</p>
      </div>
    `,
    });
  }
}
