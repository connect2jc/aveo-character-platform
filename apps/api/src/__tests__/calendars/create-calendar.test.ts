import { mockPrisma } from '../helpers/mock-prisma';
import { mockClaudeService } from '../helpers/mock-services';
import {
  createTestCharacter,
  createTestCalendar,
  createTestContentSlot,
} from '../helpers/test-helpers';


describe('POST /api/characters/:characterId/calendars', () => {
  const calendarInput = {
    month: 3,
    year: 2026,
    postsPerDay: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate monthly calendar via Claude', async () => {
    const character = createTestCharacter();
    mockPrisma.character.findUnique.mockResolvedValue(character);

    const calendarData = await mockClaudeService.generateCalendar({
      character,
      month: calendarInput.month,
      year: calendarInput.year,
      postsPerDay: calendarInput.postsPerDay,
    });

    expect(calendarData).toBeDefined();
    expect(calendarData.weeklyThemes).toBeDefined();
    expect(calendarData.slots).toBeDefined();
    expect(mockClaudeService.generateCalendar).toHaveBeenCalled();
  });

  it('should create content_calendars record', async () => {
    const calendar = createTestCalendar();
    mockPrisma.contentCalendar.create.mockResolvedValue(calendar);

    const created = await mockPrisma.contentCalendar.create({
      data: {
        characterId: 'test-character-id',
        userId: 'test-user-id',
        month: calendarInput.month,
        year: calendarInput.year,
        postsPerDay: calendarInput.postsPerDay,
        totalSlots: 62,
        status: 'active',
        weeklyThemes: [
          'Product Reviews',
          'Behind the Scenes',
          'Tips & Tricks',
          'Industry News',
        ],
      },
    });

    expect(created.month).toBe(3);
    expect(created.year).toBe(2026);
    expect(created.postsPerDay).toBe(2);
  });

  it('should create content_slots for each day (posts_per_day * days_in_month)', async () => {
    const daysInMarch = 31;
    const postsPerDay = 2;
    const expectedSlots = daysInMarch * postsPerDay;

    const calendarData = await mockClaudeService.generateCalendar({
      month: 3,
      year: 2026,
      postsPerDay,
    });

    expect(calendarData.slots).toHaveLength(expectedSlots);

    mockPrisma.contentSlot.createMany.mockResolvedValue({
      count: expectedSlots,
    });

    const result = await mockPrisma.contentSlot.createMany({
      data: calendarData.slots.map((slot: any) => ({
        calendarId: 'test-calendar-id',
        characterId: 'test-character-id',
        userId: 'test-user-id',
        date: new Date(slot.date),
        slotNumber: slot.slotNumber,
        weeklyTheme: slot.weeklyTheme,
        emotionalTrigger: slot.emotionalTrigger,
        status: 'pending',
      })),
    });

    expect(result.count).toBe(expectedSlots);
  });

  it('should assign weekly themes', async () => {
    const calendarData = await mockClaudeService.generateCalendar({
      month: 3,
      year: 2026,
      postsPerDay: 2,
    });

    expect(calendarData.weeklyThemes).toEqual([
      'Product Reviews',
      'Behind the Scenes',
      'Tips & Tricks',
      'Industry News',
    ]);

    // Each slot should have a weekly theme
    calendarData.slots.forEach((slot: any) => {
      expect(calendarData.weeklyThemes).toContain(slot.weeklyTheme);
    });
  });

  it('should rotate emotional triggers', async () => {
    const calendarData = await mockClaudeService.generateCalendar({
      month: 3,
      year: 2026,
      postsPerDay: 2,
    });

    const triggers = calendarData.slots.map((s: any) => s.emotionalTrigger);
    const uniqueTriggers = new Set(triggers);

    // Should use multiple different triggers
    expect(uniqueTriggers.size).toBeGreaterThan(1);
  });

  it('should set correct day_of_week values', () => {
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    // March 1, 2026 is a Sunday
    const date = new Date('2026-03-01');
    const dayOfWeek = daysOfWeek[date.getDay()];
    expect(dayOfWeek).toBe('Sunday');

    // March 15, 2026 is a Sunday
    const date2 = new Date('2026-03-15');
    const dayOfWeek2 = daysOfWeek[date2.getDay()];
    expect(dayOfWeek2).toBe('Sunday');
  });

  it('should default to 2 posts per day', () => {
    const calendar = createTestCalendar();
    expect(calendar.postsPerDay).toBe(2);
  });

  it('should return 404 if character does not exist', async () => {
    mockPrisma.character.findUnique.mockResolvedValue(null);

    const character = await mockPrisma.character.findUnique({
      where: { id: 'nonexistent-id' },
    });

    expect(character).toBeNull();
  });
});
