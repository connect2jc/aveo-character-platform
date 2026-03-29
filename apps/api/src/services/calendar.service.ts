import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';


export class CalendarService {
  async create(userId: string, data: {
    characterId: string;
    month: string;
    postsPerDay?: number;
    themes?: string[];
    strategyNotes?: string;
  }) {
    const character = await prisma.character.findUnique({ where: { id: data.characterId } });
    if (!character) throw new NotFoundError('Character not found');
    if (character.userId !== userId) throw new ForbiddenError('Not your character');

    const existing = await prisma.contentCalendar.findUnique({
      where: { characterId_month: { characterId: data.characterId, month: data.month } },
    });
    if (existing) throw new ConflictError('Calendar already exists for this month');

    return prisma.contentCalendar.create({
      data: {
        characterId: data.characterId,
        month: data.month,
        postsPerDay: data.postsPerDay || 2,
        themes: data.themes || [],
        strategyNotes: data.strategyNotes,
      },
    });
  }

  async list(userId: string, characterId: string) {
    const character = await prisma.character.findUnique({ where: { id: characterId } });
    if (!character) throw new NotFoundError('Character not found');
    if (character.userId !== userId) throw new ForbiddenError('Not your character');

    return prisma.contentCalendar.findMany({
      where: { characterId },
      include: { _count: { select: { slots: true } } },
      orderBy: { month: 'desc' },
    });
  }

  async getById(userId: string, calendarId: string) {
    const calendar = await prisma.contentCalendar.findUnique({
      where: { id: calendarId },
      include: {
        character: true,
        slots: {
          include: { script: true, video: true },
          orderBy: [{ scheduledDate: 'asc' }, { slotNumber: 'asc' }],
        },
      },
    });
    if (!calendar) throw new NotFoundError('Calendar not found');
    if (calendar.character.userId !== userId) throw new ForbiddenError('Not your calendar');
    return calendar;
  }

  async update(userId: string, calendarId: string, data: Record<string, any>) {
    const calendar = await this.getById(userId, calendarId);
    return prisma.contentCalendar.update({
      where: { id: calendar.id },
      data,
    });
  }

  async delete(userId: string, calendarId: string) {
    const calendar = await this.getById(userId, calendarId);
    return prisma.contentCalendar.delete({ where: { id: calendar.id } });
  }

  async createSlots(calendarId: string, slots: any[]) {
    return prisma.contentSlot.createMany({
      data: slots.map(slot => ({
        calendarId,
        characterId: slot.characterId,
        scheduledDate: new Date(slot.scheduledDate),
        scheduledTime: slot.scheduledTime,
        dayOfWeek: slot.dayOfWeek,
        slotNumber: slot.slotNumber || 1,
        contentType: slot.contentType || 'SHORT_FORM',
        topic: slot.topic,
        hook: slot.hook,
        emotionalTrigger: slot.emotionalTrigger,
        cta: slot.cta,
        platform: slot.platform || 'TIKTOK',
      })),
    });
  }
}

export const calendarService = new CalendarService();
