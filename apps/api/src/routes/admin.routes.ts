import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/users', (req, res, next) => adminController.listUsers(req, res, next));
router.get('/users/:id', (req, res, next) => adminController.getUser(req, res, next));
router.patch('/users/:id', (req, res, next) => adminController.updateUser(req, res, next));
router.get('/stats', (req, res, next) => adminController.getStats(req, res, next));
router.get('/videos', (req, res, next) => adminController.getVideos(req, res, next));

export default router;
