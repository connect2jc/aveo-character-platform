import { Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';
import { AuthRequest } from '../types';
import { Provider } from '../validators/settings.validator';

export class SettingsController {
  async getApiKeys(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const keys = await settingsService.getApiKeys(req.user!.id);
      res.json({ success: true, data: { keys } });
    } catch (error) {
      next(error);
    }
  }

  async saveApiKey(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const provider = req.params.provider as Provider;
      const result = await settingsService.setApiKey(req.user!.id, provider, req.body.apiKey);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async deleteApiKey(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const provider = req.params.provider as Provider;
      const result = await settingsService.deleteApiKey(req.user!.id, provider);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async testApiKey(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const provider = req.params.provider as Provider;
      const result = await settingsService.testApiKey(req.user!.id, provider);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getPreferences(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const preferences = await settingsService.getPreferences(req.user!.id);
      res.json({ success: true, data: { preferences } });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const preferences = await settingsService.updatePreferences(req.user!.id, req.body);
      res.json({ success: true, data: { preferences } });
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
