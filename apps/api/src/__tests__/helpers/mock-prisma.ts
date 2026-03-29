const createModelMock = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
  upsert: jest.fn(),
});

export const mockPrisma = {
  user: createModelMock(),
  character: createModelMock(),
  characterVariation: createModelMock(),
  voiceOption: createModelMock(),
  contentCalendar: createModelMock(),
  contentSlot: createModelMock(),
  script: createModelMock(),
  video: createModelMock(),
  videoClip: createModelMock(),
  publishRecord: createModelMock(),
  platformConnection: createModelMock(),
  usageTracking: createModelMock(),
  subscription: createModelMock(),
  invoice: createModelMock(),
  apiCostLog: createModelMock(),
  refreshToken: createModelMock(),
  passwordReset: createModelMock(),
  userApiKey: createModelMock(),
  studioProject: createModelMock(),
  studioTrack: createModelMock(),
  $transaction: jest.fn((fn: any): any => {
    if (typeof fn === 'function') {
      return fn(mockPrisma);
    }
    return Promise.all(fn);
  }),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

export type MockPrisma = typeof mockPrisma;
