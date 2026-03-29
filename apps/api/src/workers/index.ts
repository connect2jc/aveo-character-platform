import { logger } from '../utils/logger';

// Import all workers to start them
import { audioWorker } from './generate-audio.worker';
import { clipsWorker } from './generate-clips.worker';
import { stitchWorker } from './stitch-video.worker';
import { scriptsWorker } from './generate-scripts.worker';

logger.info('Starting all workers...');

audioWorker.on('completed', (job) => {
  logger.info(`Audio worker completed job ${job.id}`);
});
audioWorker.on('failed', (job, err) => {
  logger.error(`Audio worker failed job ${job?.id}`, { error: err.message });
});

clipsWorker.on('completed', (job) => {
  logger.info(`Clips worker completed job ${job.id}`);
});
clipsWorker.on('failed', (job, err) => {
  logger.error(`Clips worker failed job ${job?.id}`, { error: err.message });
});

stitchWorker.on('completed', (job) => {
  logger.info(`Stitch worker completed job ${job.id}`);
});
stitchWorker.on('failed', (job, err) => {
  logger.error(`Stitch worker failed job ${job?.id}`, { error: err.message });
});

scriptsWorker.on('completed', (job) => {
  logger.info(`Scripts worker completed job ${job.id}`);
});
scriptsWorker.on('failed', (job, err) => {
  logger.error(`Scripts worker failed job ${job?.id}`, { error: err.message });
});

logger.info('All workers started successfully');

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down workers...');
  await Promise.all([
    audioWorker.close(),
    clipsWorker.close(),
    stitchWorker.close(),
    scriptsWorker.close(),
  ]);
  logger.info('All workers shut down');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
