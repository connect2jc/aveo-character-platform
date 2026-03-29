import { Router } from 'express';
import { videosController } from '../controllers/videos.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createVideoSchema, updateVideoSchema } from '../validators/video.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createVideoSchema), (req, res, next) => videosController.create(req, res, next));
router.get('/', (req, res, next) => videosController.list(req, res, next));
router.get('/:id', (req, res, next) => videosController.getById(req, res, next));
router.patch('/:id', validate(updateVideoSchema), (req, res, next) => videosController.update(req, res, next));
router.delete('/:id', (req, res, next) => videosController.delete(req, res, next));
router.post('/:id/retry', (req, res, next) => videosController.retry(req, res, next));

export default router;
