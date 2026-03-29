import { Request, Response, NextFunction } from 'express';
import { Queue } from 'bullmq';
import { prisma } from '../config/database';
import { stripe } from '../config/stripe';
import { billingService } from '../services/billing.service';
import { redisConnection } from '../config/redis';
import { env } from '../config/env';
import { logger } from '../utils/logger';


export class WebhooksController {
  async stripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sig = req.headers['stripe-signature'] as string;
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        logger.error('Stripe webhook signature verification failed', { error: err.message });
        res.status(400).json({ error: 'Webhook signature verification failed' });
        return;
      }

      logger.info('Stripe webhook received', { type: event.type });

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await billingService.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await billingService.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          logger.info('Invoice payment succeeded', { invoiceId: (event.data.object as any).id });
          break;
        case 'invoice.payment_failed':
          logger.warn('Invoice payment failed', { invoiceId: (event.data.object as any).id });
          break;
        default:
          logger.info('Unhandled Stripe event', { type: event.type });
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  async heygenWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { event_type, event_data } = req.body;
      logger.info('HeyGen webhook received', { event_type });

      if (event_type === 'avatar_video.success') {
        const jobId = event_data.video_id;
        const videoUrl = event_data.url;

        const clip = await prisma.videoClip.findFirst({
          where: { heygenJobId: jobId },
        });

        if (clip) {
          await prisma.videoClip.update({
            where: { id: clip.id },
            data: {
              status: 'COMPLETED',
              clipUrl: videoUrl,
            },
          });

          // Check if all clips for this video are done
          const allClips = await prisma.videoClip.findMany({
            where: { videoId: clip.videoId },
          });

          const allCompleted = allClips.every(c => c.status === 'COMPLETED');
          if (allCompleted) {
            await prisma.video.update({
              where: { id: clip.videoId },
              data: { status: 'STITCHING' },
            });

            const stitchQueue = new Queue('stitch-video', { connection: redisConnection });
            await stitchQueue.add('stitch-video', { videoId: clip.videoId });
          }
        }
      } else if (event_type === 'avatar_video.fail') {
        const jobId = event_data.video_id;
        const clip = await prisma.videoClip.findFirst({
          where: { heygenJobId: jobId },
        });

        if (clip) {
          await prisma.videoClip.update({
            where: { id: clip.id },
            data: {
              status: 'FAILED',
              errorMessage: event_data.msg || 'HeyGen generation failed',
            },
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}

export const webhooksController = new WebhooksController();
