import { Router } from 'express';
import { contentSlotsController } from '../controllers/content-slots.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/calendar/:calendarId', (req, res, next) => contentSlotsController.list(req, res, next));
router.get('/:id', (req, res, next) => contentSlotsController.getById(req, res, next));
router.patch('/:id', (req, res, next) => contentSlotsController.update(req, res, next));
router.delete('/:id', (req, res, next) => contentSlotsController.delete(req, res, next));
router.post('/:id/assign-script', (req, res, next) => contentSlotsController.assignScript(req, res, next));
router.post('/:id/assign-video', (req, res, next) => contentSlotsController.assignVideo(req, res, next));

export default router;
