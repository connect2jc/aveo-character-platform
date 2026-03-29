import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rate-limit';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/refresh', validate(refreshSchema), (req, res, next) => authController.refresh(req, res, next));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', validate(resetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));

export default router;
