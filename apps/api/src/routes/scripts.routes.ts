import { Router } from 'express';
import { scriptsController } from '../controllers/scripts.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { aiLimiter } from '../middleware/rate-limit';
import {
  generateScriptSchema,
  rewriteScriptSchema,
  updateScriptSchema,
} from '../validators/script.validator';

const router = Router();

router.use(authenticate);

router.post('/generate', aiLimiter, validate(generateScriptSchema), (req, res, next) => scriptsController.generate(req, res, next));
router.post('/rewrite', aiLimiter, validate(rewriteScriptSchema), (req, res, next) => scriptsController.rewrite(req, res, next));
router.get('/character/:characterId', (req, res, next) => scriptsController.list(req, res, next));
router.get('/:id', (req, res, next) => scriptsController.getById(req, res, next));
router.patch('/:id', validate(updateScriptSchema), (req, res, next) => scriptsController.update(req, res, next));
router.delete('/:id', (req, res, next) => scriptsController.delete(req, res, next));

export default router;
