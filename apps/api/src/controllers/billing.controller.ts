import { Response, NextFunction } from 'express';
import { billingService } from '../services/billing.service';
import { AuthRequest } from '../types';

export class BillingController {
  async createCheckout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { priceId } = req.body;
      const session = await billingService.createCheckoutSession(req.user!.id, priceId);
      res.json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  async createPortal(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await billingService.createPortalSession(req.user!.id);
      res.json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  async getUsage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usage = await billingService.getUsage(req.user!.id);
      res.json({ success: true, data: { usage } });
    } catch (error) {
      next(error);
    }
  }

  async getSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscription = await billingService.getSubscription(req.user!.id);
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  }
}

export const billingController = new BillingController();
