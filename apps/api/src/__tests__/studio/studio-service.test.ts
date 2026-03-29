jest.mock('../../config/database', () => ({
  prisma: require('../helpers/mock-prisma').mockPrisma,
}));

import { StudioService } from '../../services/studio.service';
import { mockPrisma } from '../helpers/mock-prisma';
import { createTestStudioProject, createTestStudioTrack } from '../helpers/test-helpers';
// Custom errors use Object.setPrototypeOf to AppError, so match by message

const service = new StudioService();
const userId = 'test-user-id';

describe('StudioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a project with default aspect ratio', async () => {
      const project = createTestStudioProject();
      mockPrisma.studioProject.create.mockResolvedValue(project);

      const result = await service.createProject(userId, { title: 'Test Project' });
      expect(mockPrisma.studioProject.create).toHaveBeenCalledWith({
        data: { userId, title: 'Test Project', aspectRatio: '9:16' },
        include: { tracks: true },
      });
      expect(result).toEqual(project);
    });

    it('should accept custom aspect ratio', async () => {
      const project = createTestStudioProject({ aspectRatio: '16:9' });
      mockPrisma.studioProject.create.mockResolvedValue(project);

      await service.createProject(userId, { title: 'Wide', aspectRatio: '16:9' });
      expect(mockPrisma.studioProject.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ aspectRatio: '16:9' }) })
      );
    });
  });

  describe('listProjects', () => {
    it('should return paginated projects', async () => {
      const projects = [createTestStudioProject()];
      mockPrisma.studioProject.findMany.mockResolvedValue(projects);
      mockPrisma.studioProject.count.mockResolvedValue(1);

      const result = await service.listProjects(userId, 1, 20);
      expect(result).toEqual({
        projects,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should calculate totalPages correctly', async () => {
      mockPrisma.studioProject.findMany.mockResolvedValue([]);
      mockPrisma.studioProject.count.mockResolvedValue(45);

      const result = await service.listProjects(userId, 1, 20);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('getProject', () => {
    it('should return project when owned by user', async () => {
      const project = createTestStudioProject();
      mockPrisma.studioProject.findUnique.mockResolvedValue(project);

      const result = await service.getProject(userId, 'test-project-id');
      expect(result).toEqual(project);
    });

    it('should throw NotFoundError when project does not exist', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(null);
      await expect(service.getProject(userId, 'nonexistent')).rejects.toThrow('not found');
    });

    it('should throw ForbiddenError when project belongs to another user', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(
        createTestStudioProject({ userId: 'other-user' })
      );
      await expect(service.getProject(userId, 'test-project-id')).rejects.toThrow('Forbidden');
    });
  });

  describe('updateProject', () => {
    it('should update project title', async () => {
      const project = createTestStudioProject();
      mockPrisma.studioProject.findUnique.mockResolvedValue(project);
      mockPrisma.studioProject.update.mockResolvedValue({ ...project, title: 'Updated' });

      const result = await service.updateProject(userId, 'test-project-id', { title: 'Updated' });
      expect(mockPrisma.studioProject.update).toHaveBeenCalledWith({
        where: { id: 'test-project-id' },
        data: { title: 'Updated' },
        include: { tracks: true },
      });
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteProject', () => {
    it('should delete project owned by user', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(createTestStudioProject());
      mockPrisma.studioProject.delete.mockResolvedValue({});

      await service.deleteProject(userId, 'test-project-id');
      expect(mockPrisma.studioProject.delete).toHaveBeenCalledWith({
        where: { id: 'test-project-id' },
      });
    });

    it('should throw when project not owned', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(
        createTestStudioProject({ userId: 'other' })
      );
      await expect(service.deleteProject(userId, 'test-project-id')).rejects.toThrow('Forbidden');
    });
  });

  describe('addTrack', () => {
    it('should add a video track to the project', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(createTestStudioProject());
      const track = createTestStudioTrack();
      mockPrisma.studioTrack.create.mockResolvedValue(track);

      const result = await service.addTrack(userId, 'test-project-id', {
        type: 'video',
        sourceUrl: 'https://example.com/video.mp4',
        fileName: 'video.mp4',
      });

      expect(mockPrisma.studioTrack.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'test-project-id',
          type: 'video',
          sourceUrl: 'https://example.com/video.mp4',
          startTime: 0,
          trimStart: 0,
          volume: 1.0,
          trackIndex: 0,
        }),
      });
      expect(result).toEqual(track);
    });

    it('should respect custom track values', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(createTestStudioProject());
      mockPrisma.studioTrack.create.mockResolvedValue(createTestStudioTrack());

      await service.addTrack(userId, 'test-project-id', {
        type: 'audio',
        sourceUrl: 'https://example.com/audio.mp3',
        startTime: 5,
        duration: 30,
        trimStart: 2,
        trimEnd: 28,
        volume: 0.8,
        trackIndex: 1,
      });

      expect(mockPrisma.studioTrack.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          startTime: 5,
          duration: 30,
          trimStart: 2,
          trimEnd: 28,
          volume: 0.8,
          trackIndex: 1,
        }),
      });
    });
  });

  describe('updateTrack', () => {
    it('should update track properties', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(createTestStudioProject());
      mockPrisma.studioTrack.findUnique.mockResolvedValue(createTestStudioTrack());
      mockPrisma.studioTrack.update.mockResolvedValue(createTestStudioTrack({ volume: 0.5 }));

      const result = await service.updateTrack(userId, 'test-project-id', 'test-track-id', { volume: 0.5 });
      expect(mockPrisma.studioTrack.update).toHaveBeenCalledWith({
        where: { id: 'test-track-id' },
        data: { volume: 0.5 },
      });
    });

    it('should throw NotFoundError when track not found', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(createTestStudioProject());
      mockPrisma.studioTrack.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTrack(userId, 'test-project-id', 'missing-track', { volume: 0.5 })
      ).rejects.toThrow('not found');
    });

    it('should throw NotFoundError when track belongs to different project', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(createTestStudioProject());
      mockPrisma.studioTrack.findUnique.mockResolvedValue(
        createTestStudioTrack({ projectId: 'other-project' })
      );

      await expect(
        service.updateTrack(userId, 'test-project-id', 'test-track-id', { volume: 0.5 })
      ).rejects.toThrow('not found');
    });
  });

  describe('deleteTrack', () => {
    it('should delete track from project', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(createTestStudioProject());
      mockPrisma.studioTrack.findUnique.mockResolvedValue(createTestStudioTrack());
      mockPrisma.studioTrack.delete.mockResolvedValue({});

      await service.deleteTrack(userId, 'test-project-id', 'test-track-id');
      expect(mockPrisma.studioTrack.delete).toHaveBeenCalledWith({ where: { id: 'test-track-id' } });
    });
  });

  describe('importAveoVideo', () => {
    it('should create a track from an existing Aveo video', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(createTestStudioProject());
      mockPrisma.video.findUnique.mockResolvedValue({
        id: 'video-1',
        userId,
        finalVideoUrl: 'https://s3.example.com/video.mp4',
        totalDurationSeconds: 45.5,
      });
      mockPrisma.studioTrack.create.mockResolvedValue(createTestStudioTrack());

      await service.importAveoVideo(userId, 'test-project-id', 'video-1');
      expect(mockPrisma.studioTrack.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'video',
          sourceUrl: 'https://s3.example.com/video.mp4',
          fileName: 'aveo_video_video-1.mp4',
          duration: 45.5,
        }),
      });
    });

    it('should throw NotFoundError when video not found', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(createTestStudioProject());
      mockPrisma.video.findUnique.mockResolvedValue(null);

      await expect(
        service.importAveoVideo(userId, 'test-project-id', 'missing')
      ).rejects.toThrow('not found');
    });

    it('should throw NotFoundError when video belongs to another user', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(createTestStudioProject());
      mockPrisma.video.findUnique.mockResolvedValue({ id: 'v1', userId: 'other', finalVideoUrl: 'url' });

      await expect(
        service.importAveoVideo(userId, 'test-project-id', 'v1')
      ).rejects.toThrow('not found');
    });

    it('should throw NotFoundError when video has no output', async () => {
      mockPrisma.studioProject.findUnique.mockResolvedValue(createTestStudioProject());
      mockPrisma.video.findUnique.mockResolvedValue({ id: 'v1', userId, finalVideoUrl: null });

      await expect(
        service.importAveoVideo(userId, 'test-project-id', 'v1')
      ).rejects.toThrow('no output file');
    });
  });

  describe('updateProjectStatus', () => {
    it('should update status with optional fields', async () => {
      mockPrisma.studioProject.update.mockResolvedValue({});

      await service.updateProjectStatus('proj-1', 'COMPLETED', 'https://out.mp4', 'https://thumb.jpg', 60);
      expect(mockPrisma.studioProject.update).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        data: {
          status: 'COMPLETED',
          outputUrl: 'https://out.mp4',
          thumbnailUrl: 'https://thumb.jpg',
          totalDuration: 60,
        },
      });
    });

    it('should update status only when no optional fields', async () => {
      mockPrisma.studioProject.update.mockResolvedValue({});

      await service.updateProjectStatus('proj-1', 'FAILED');
      expect(mockPrisma.studioProject.update).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        data: { status: 'FAILED' },
      });
    });
  });
});
