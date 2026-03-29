import { Router } from 'express';
import { publishingController } from '../controllers/publishing.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/connect', (req, res, next) => publishingController.connectPlatform(req, res, next));
router.get('/connections', (req, res, next) => publishingController.listConnections(req, res, next));
router.delete('/disconnect/:platform', (req, res, next) => publishingController.disconnectPlatform(req, res, next));
router.post('/publish/:slotId', (req, res, next) => publishingController.publishSlot(req, res, next));
router.get('/queue', (req, res, next) => publishingController.getQueue(req, res, next));

export default router;
