import { Router } from 'express';
import express from 'express';
import { webhooksController } from '../controllers/webhooks.controller';

const router = Router();

// Stripe webhook needs raw body
router.post('/stripe', express.raw({ type: 'application/json' }), (req, res, next) => webhooksController.stripeWebhook(req, res, next));

// HeyGen webhook uses JSON
router.post('/heygen', express.json(), (req, res, next) => webhooksController.heygenWebhook(req, res, next));

export default router;
