import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { stripe } from '../config/stripe';
import { TokenPair, AuthUser } from '../types';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../utils/errors';

export class AuthService {
  async register(email: string, password: string, name: string): Promise<{ user: any; tokens: TokenPair }> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const stripeCustomer = await stripe.customers.create({
      email,
      name,
      metadata: { source: 'aveo_platform' },
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        stripeCustomerId: stripeCustomer.id,
      },
    });

    const tokens = this.generateTokens(user);

    await prisma.usageTracking.create({
      data: {
        userId: user.id,
        month: new Date().toISOString().slice(0, 7),
        charactersAllowed: 1,
        videosAllowed: 10,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        onboardingCompleted: user.onboardingCompleted,
      },
      tokens,
    };
  }

  async login(email: string, password: string): Promise<{ user: any; tokens: TokenPair }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is suspended or deleted');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as AuthUser & { type: string };
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedError('User not found or inactive');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expired');
      }
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // Email sending delegated to email service
    // The controller will call EmailService.sendResetEmail
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  private generateTokens(user: { id: string; email: string; role: string; plan: string }): TokenPair {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, plan: user.plan },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY as any }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, plan: user.plan, type: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY as any }
    );

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
