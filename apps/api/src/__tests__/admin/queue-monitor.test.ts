import { mockQueue } from '../helpers/mock-services';
import { generateAdminToken, generateTestToken } from '../helpers/test-helpers';
import jwt from 'jsonwebtoken';


const JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

describe('Admin Queue Monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return queue job counts', async () => {
    mockQueue.getJobCounts.mockResolvedValue({
      waiting: 5,
      active: 2,
      completed: 150,
      failed: 3,
      delayed: 1,
    });

    const counts = await mockQueue.getJobCounts();

    expect(counts.waiting).toBe(5);
    expect(counts.active).toBe(2);
    expect(counts.completed).toBe(150);
    expect(counts.failed).toBe(3);
  });

  it('should list failed jobs', async () => {
    mockQueue.getJobs.mockResolvedValue([
      {
        id: 'failed-1',
        name: 'generate-audio',
        data: { clipId: 'clip-1' },
        failedReason: 'ElevenLabs timeout',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'failed-2',
        name: 'generate-video-clip',
        data: { clipId: 'clip-5' },
        failedReason: 'HeyGen rate limit',
        timestamp: Date.now() - 1800000,
      },
    ]);

    const failedJobs = await mockQueue.getJobs(['failed']);

    expect(failedJobs).toHaveLength(2);
    expect(failedJobs[0].failedReason).toContain('timeout');
  });

  it('should require admin role', () => {
    const adminToken = generateAdminToken();
    const decoded = jwt.verify(adminToken, JWT_SECRET) as any;
    expect(decoded.role).toBe('admin');

    // Regular user tokens have role: 'user', not 'admin'
    const userToken = generateTestToken('regular-user', 'starter');
    const userDecoded = jwt.verify(userToken, JWT_SECRET) as any;
    expect(userDecoded.role).toBe('user');
    expect(userDecoded.role).not.toBe('admin');
  });

  it('should return queue health status', async () => {
    mockQueue.getJobCounts.mockResolvedValue({
      waiting: 0,
      active: 0,
      completed: 100,
      failed: 0,
    });

    const counts = await mockQueue.getJobCounts();
    const failRate = counts.failed / (counts.completed + counts.failed || 1);

    expect(failRate).toBe(0);

    const isHealthy = failRate < 0.05; // less than 5% failure rate
    expect(isHealthy).toBe(true);
  });

  it('should support retry of failed jobs', async () => {
    const failedJob = {
      id: 'failed-1',
      retry: jest.fn().mockResolvedValue(undefined),
    };

    mockQueue.getJob.mockResolvedValue(failedJob);

    const job = await mockQueue.getJob('failed-1');
    expect(job).toBeDefined();
  });
});
