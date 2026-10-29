import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly from?: string;
  private readonly transporter?: Transporter;

  constructor(private readonly ConfigService: ConfigService) {
    const user = this.ConfigService.get<string>('USER_EMAIL');
    const pass = this.ConfigService.get<string>('APP_PASSWORD')?.replace(
      /\s+/g,
      '',
    );
    if (!user || !pass) {
      return;
    }
    this.from = user;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  async sendEmail({
    to,
    subject,
    text,
  }: {
    to: string;
    subject: string;
    text: string;
  }) {
    if (!this.transporter || !this.from) {
      throw new InternalServerErrorException(
        'Set USER_EMAIL in .env to the Gmail account that owns the app password.',
      );
    }
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text: String(text),
    });
  }
}
