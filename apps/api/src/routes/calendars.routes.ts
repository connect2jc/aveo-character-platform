import { Router } from 'express';
import { calendarsController } from '../controllers/calendars.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { aiLimiter } from '../middleware/rate-limit';
import {
  createCalendarSchema,
  generateCalendarSchema,
  updateCalendarSchema,
} from '../validators/calendar.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createCalendarSchema), (req, res, next) => calendarsController.create(req, res, next));
router.post('/generate', aiLimiter, validate(generateCalendarSchema), (req, res, next) => calendarsController.generate(req, res, next));
router.get('/character/:characterId', (req, res, next) => calendarsController.list(req, res, next));
router.get('/:id', (req, res, next) => calendarsController.getById(req, res, next));
router.patch('/:id', validate(updateCalendarSchema), (req, res, next) => calendarsController.update(req, res, next));
router.delete('/:id', (req, res, next) => calendarsController.delete(req, res, next));

export default router;
