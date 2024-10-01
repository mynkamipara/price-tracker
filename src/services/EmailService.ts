import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from 'src/config';
import { Logger } from 'src/logging/Logger';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger('EmailService');

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }



  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions = {
      from: config.email.user,
      to,
      subject,
      text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.info('Email sent successfully');
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error; // Rethrow or handle as needed
    }
  }
}
