import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { generalLimiter } from './middleware/rate-limit';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './routes/auth.routes';
import charactersRoutes from './routes/characters.routes';
import calendarsRoutes from './routes/calendars.routes';
import contentSlotsRoutes from './routes/content-slots.routes';
import scriptsRoutes from './routes/scripts.routes';
import videosRoutes from './routes/videos.routes';
import publishingRoutes from './routes/publishing.routes';
import billingRoutes from './routes/billing.routes';
import adminRoutes from './routes/admin.routes';
import webhooksRoutes from './routes/webhooks.routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.APP_URL,
  credentials: true,
}));

// Webhooks need raw body (must come before json parser)
app.use('/api/webhooks', webhooksRoutes);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('short'));

// Rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', charactersRoutes);
app.use('/api/calendars', calendarsRoutes);
app.use('/api/content-slots', contentSlotsRoutes);
app.use('/api/scripts', scriptsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/publishing', publishingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found', statusCode: 404 },
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  logger.info(`Aveo API server running on port ${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

export default app;
