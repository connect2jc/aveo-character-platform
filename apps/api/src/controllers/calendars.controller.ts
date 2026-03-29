import { Response, NextFunction } from 'express';
import { calendarService } from '../services/calendar.service';
import { claudeService } from '../services/ai/claude.service';
import { characterService } from '../services/character.service';
import { AuthRequest } from '../types';

export class CalendarsController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const calendar = await calendarService.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data: { calendar } });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const characterId = req.params.characterId as string;
      const calendars = await calendarService.list(req.user!.id, characterId);
      res.json({ success: true, data: { calendars } });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const calendar = await calendarService.getById(req.user!.id, req.params.id as string);
      res.json({ success: true, data: { calendar } });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const calendar = await calendarService.update(req.user!.id, req.params.id as string, req.body);
      res.json({ success: true, data: { calendar } });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await calendarService.delete(req.user!.id, req.params.id as string);
      res.json({ success: true, data: { message: 'Calendar deleted' } });
    } catch (error) {
      next(error);
    }
  }

  async generate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { characterId, month, postsPerDay } = req.body;
      const character = await characterService.getById(req.user!.id, characterId);

      const generatedCalendar = await claudeService.generateContentCalendar(
        {
          name: character.name,
          niche: character.niche || '',
          targetAudience: character.targetAudience || '',
          personality: character.personality || '',
          speakingStyle: character.speakingStyle || '',
          coreBelief: character.coreBelief || '',
        },
        month,
        postsPerDay || 2
      );

      const calendar = await calendarService.create(req.user!.id, {
        characterId,
        month,
        postsPerDay: postsPerDay || 2,
        themes: generatedCalendar.themes,
        strategyNotes: generatedCalendar.strategyNotes,
      });

      if (generatedCalendar.slots && generatedCalendar.slots.length > 0) {
        await calendarService.createSlots(
          calendar.id,
          generatedCalendar.slots.map(slot => ({
            ...slot,
            characterId,
          }))
        );
      }

      const fullCalendar = await calendarService.getById(req.user!.id, calendar.id);

      res.status(201).json({ success: true, data: { calendar: fullCalendar } });
    } catch (error) {
      next(error);
    }
  }
}

export const calendarsController = new CalendarsController();
