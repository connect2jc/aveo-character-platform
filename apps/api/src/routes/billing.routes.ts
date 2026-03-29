import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/checkout', (req, res, next) => billingController.createCheckout(req, res, next));
router.post('/portal', (req, res, next) => billingController.createPortal(req, res, next));
router.get('/usage', (req, res, next) => billingController.getUsage(req, res, next));
router.get('/subscription', (req, res, next) => billingController.getSubscription(req, res, next));

export default router;
