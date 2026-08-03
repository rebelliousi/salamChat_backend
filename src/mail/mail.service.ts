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
    const currentYear = new Date().getFullYear();

    await this.transporter.sendMail({
      from: `"SalamChat" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `${code} is your verification code`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Inter fontu modern UI'ın kalbidir -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #000000; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; margin: 0 auto; padding: 60px 24px;">
          
          <!-- Logo Section -->
          <tr>
            <td style="padding-bottom: 48px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 1.5px;"><div style="width: 13px; height: 13px; background-color: #FBBF24; border-radius: 4px;"></div></td>
                        <td style="padding: 1.5px;"><div style="width: 13px; height: 13px; background-color: #000000; border-radius: 4px;"></div></td>
                      </tr>
                      <tr>
                        <td style="padding: 1.5px;"><div style="width: 13px; height: 13px; background-color: #F472B6; border-radius: 4px;"></div></td>
                        <td style="padding: 1.5px;"><div style="width: 13px; height: 13px; background-color: #22D3EE; border-radius: 4px;"></div></td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding-left: 14px;">
                    <span style="font-size: 22px; font-weight: 700; color: #8B5CF6; letter-spacing: -0.8px;">SalamChat</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td>
              <h2 style="font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin: 0 0 20px 0; color: #000000;">Confirm your email address</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555555; margin: 0 0 32px 0;">
                Please use the following verification code to confirm your email and complete your account setup.
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td>
              <div style="background-color: #F3F4F6; border-radius: 16px; padding: 32px; text-align: center;">
                <span style="font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace; font-size: 40px; font-weight: 700; letter-spacing: 6px; color: #8B5CF6;">${code}</span>
              </div>
              <p style="font-size: 14px; color: #888888; margin: 24px 0 0 0; text-align: center;">
                This code expires in 2 minutes.
              </p>
            </td>
          </tr>

          <!-- Footer Divider -->
          <tr>
            <td style="padding-top: 60px;">
              <div style="height: 1px; width: 100%; background-color: #EEEEEE;"></div>
            </td>
          </tr>

          <!-- Footer Content -->
          <tr>
            <td style="padding-top: 24px;">
              <p style="font-size: 13px; color: #999999; margin: 0; line-height: 1.5;">
                ✨ Expanding horizons one word at a time.<br>
                <span style="color: #BBBBBB;">&copy; ${currentYear} SalamChat Inc. All rights reserved.</span>
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    });
  }
}