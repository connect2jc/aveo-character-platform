import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class EmailService {
  private apiKey: string;

  constructor() {
    this.apiKey = env.RESEND_API_KEY;
  }

  async sendResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${env.APP_URL}/reset-password?token=${resetToken}`;

    try {
      await axios.post(
        'https://api.resend.com/emails',
        {
          from: 'Aveo <noreply@aveo.ai>',
          to: email,
          subject: 'Reset your Aveo password',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Password Reset</h2>
              <p>You requested a password reset. Click the link below to set a new password:</p>
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Reset Password</a>
              <p style="margin-top: 24px; color: #666;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
            </div>
          `,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      logger.info('Reset email sent', { email });
    } catch (error: any) {
      logger.error('Failed to send reset email', { email, error: error.message });
      throw new Error('Failed to send reset email');
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await axios.post(
        'https://api.resend.com/emails',
        {
          from: 'Aveo <noreply@aveo.ai>',
          to: email,
          subject: 'Welcome to Aveo!',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to Aveo, ${name}!</h2>
              <p>You are ready to create your first AI character and start generating viral content.</p>
              <a href="${env.APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Go to Dashboard</a>
            </div>
          `,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      logger.info('Welcome email sent', { email });
    } catch (error: any) {
      logger.error('Failed to send welcome email', { email, error: error.message });
    }
  }
}

export const emailService = new EmailService();
