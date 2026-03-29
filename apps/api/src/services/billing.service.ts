import { prisma } from '../config/database';
import { stripe } from '../config/stripe';
import { NotFoundError, BadRequestError } from '../utils/errors';


const PLAN_LIMITS: Record<string, { characters: number; videos: number }> = {
  FREE: { characters: 1, videos: 10 },
  STARTER: { characters: 3, videos: 50 },
  PRO: { characters: 10, videos: 200 },
  AGENCY: { characters: 50, videos: 1000 },
};

export class BillingService {
  async createCheckoutSession(userId: string, priceId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    if (!user.stripeCustomerId) throw new BadRequestError('No Stripe customer found');

    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/billing/cancel`,
      metadata: { userId },
    });

    return { sessionId: session.id, url: session.url };
  }

  async createPortalSession(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    if (!user.stripeCustomerId) throw new BadRequestError('No Stripe customer found');

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.APP_URL}/billing`,
    });

    return { url: session.url };
  }

  async handleSubscriptionUpdated(subscription: any) {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: subscription.customer as string },
    });
    if (!user) return;

    const plan = this.getPlanFromSubscription(subscription);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan,
        stripeSubscriptionId: subscription.id,
      },
    });

    const month = new Date().toISOString().slice(0, 7);
    const limits = PLAN_LIMITS[plan];

    await prisma.usageTracking.upsert({
      where: { userId_month: { userId: user.id, month } },
      create: {
        userId: user.id,
        month,
        charactersAllowed: limits.characters,
        videosAllowed: limits.videos,
      },
      update: {
        charactersAllowed: limits.characters,
        videosAllowed: limits.videos,
      },
    });
  }

  async handleSubscriptionDeleted(subscription: any) {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: subscription.customer as string },
    });
    if (!user) return;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'FREE',
        stripeSubscriptionId: null,
      },
    });
  }

  async getUsage(userId: string) {
    const month = new Date().toISOString().slice(0, 7);
    let usage = await prisma.usageTracking.findUnique({
      where: { userId_month: { userId, month } },
    });

    if (!usage) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const limits = PLAN_LIMITS[user?.plan || 'FREE'];
      usage = await prisma.usageTracking.create({
        data: {
          userId,
          month,
          charactersAllowed: limits.characters,
          videosAllowed: limits.videos,
        },
      });
    }

    return usage;
  }

  async getSubscription(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    if (!user.stripeSubscriptionId) {
      return { plan: user.plan, subscription: null };
    }

    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    return { plan: user.plan, subscription };
  }

  private getPlanFromSubscription(subscription: any): any {
    const priceId = subscription.items?.data?.[0]?.price?.id;
    const priceToPlan: Record<string, string> = {
      [process.env.STRIPE_STARTER_PRICE_ID || '']: 'STARTER',
      [process.env.STRIPE_PRO_PRICE_ID || '']: 'PRO',
      [process.env.STRIPE_AGENCY_PRICE_ID || '']: 'AGENCY',
    };
    return priceToPlan[priceId] || 'STARTER';
  }
}

export const billingService = new BillingService();
