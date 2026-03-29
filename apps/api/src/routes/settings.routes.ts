import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { saveApiKeySchema, updatePreferencesSchema } from '../validators/settings.validator';

const router = Router();

router.use(authenticate);

// API Keys
router.get('/api-keys', (req, res, next) => settingsController.getApiKeys(req, res, next));
router.put('/api-keys/:provider', validate(saveApiKeySchema), (req, res, next) => settingsController.saveApiKey(req, res, next));
router.delete('/api-keys/:provider', (req, res, next) => settingsController.deleteApiKey(req, res, next));
router.post('/api-keys/:provider/test', (req, res, next) => settingsController.testApiKey(req, res, next));

// Provider Preferences
router.get('/preferences', (req, res, next) => settingsController.getPreferences(req, res, next));
router.put('/preferences', validate(updatePreferencesSchema), (req, res, next) => settingsController.updatePreferences(req, res, next));

export default router;
