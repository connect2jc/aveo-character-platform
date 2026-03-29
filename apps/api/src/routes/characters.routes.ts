import { Router } from 'express';
import { charactersController } from '../controllers/characters.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { aiLimiter } from '../middleware/rate-limit';
import {
  createCharacterSchema,
  updateCharacterSchema,
  generateProfileSchema,
  generateImageSchema,
  selectImageSchema,
  generateVariationsSchema,
  generateVoiceSchema,
  testVoiceSchema,
  selectVoiceSchema,
} from '../validators/character.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createCharacterSchema), (req, res, next) => charactersController.create(req, res, next));
router.get('/', (req, res, next) => charactersController.list(req, res, next));
router.get('/:id', (req, res, next) => charactersController.getById(req, res, next));
router.patch('/:id', validate(updateCharacterSchema), (req, res, next) => charactersController.update(req, res, next));
router.delete('/:id', (req, res, next) => charactersController.delete(req, res, next));

// AI generation endpoints
router.post('/:id/generate-profile', aiLimiter, validate(generateProfileSchema), (req, res, next) => charactersController.generateProfile(req, res, next));
router.post('/:id/generate-image', aiLimiter, validate(generateImageSchema), (req, res, next) => charactersController.generateImage(req, res, next));
router.post('/:id/select-image', validate(selectImageSchema), (req, res, next) => charactersController.selectImage(req, res, next));
router.post('/:id/generate-variations', aiLimiter, validate(generateVariationsSchema), (req, res, next) => charactersController.generateVariations(req, res, next));
router.post('/:id/generate-voice', aiLimiter, validate(generateVoiceSchema), (req, res, next) => charactersController.generateVoice(req, res, next));
router.post('/:id/test-voice', validate(testVoiceSchema), (req, res, next) => charactersController.testVoice(req, res, next));
router.post('/:id/select-voice', validate(selectVoiceSchema), (req, res, next) => charactersController.selectVoice(req, res, next));

export default router;
