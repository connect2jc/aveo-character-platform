import { Router } from 'express';
import multer from 'multer';
import { studioController } from '../controllers/studio.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  addTrackSchema,
  updateTrackSchema,
} from '../validators/studio.validator';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video and audio files are allowed.'));
    }
  },
});

router.use(authenticate);

// Projects
router.post('/projects', validate(createProjectSchema), (req, res, next) => studioController.createProject(req, res, next));
router.get('/projects', (req, res, next) => studioController.listProjects(req, res, next));
router.get('/projects/:id', (req, res, next) => studioController.getProject(req, res, next));
router.patch('/projects/:id', validate(updateProjectSchema), (req, res, next) => studioController.updateProject(req, res, next));
router.delete('/projects/:id', (req, res, next) => studioController.deleteProject(req, res, next));

// Tracks
router.post('/projects/:id/tracks', validate(addTrackSchema), (req, res, next) => studioController.addTrack(req, res, next));
router.patch('/projects/:id/tracks/:trackId', validate(updateTrackSchema), (req, res, next) => studioController.updateTrack(req, res, next));
router.delete('/projects/:id/tracks/:trackId', (req, res, next) => studioController.deleteTrack(req, res, next));

// Upload & Import
router.post('/projects/:id/upload', upload.single('file'), (req, res, next) => studioController.uploadFile(req, res, next));
router.post('/projects/:id/import-video/:videoId', (req, res, next) => studioController.importVideo(req, res, next));

// Render
router.post('/projects/:id/render', (req, res, next) => studioController.startRender(req, res, next));
router.get('/projects/:id/render-status', (req, res, next) => studioController.getRenderStatus(req, res, next));

export default router;
