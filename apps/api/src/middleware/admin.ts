import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ForbiddenError } from '../utils/errors';

export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    next(new ForbiddenError('Admin access required'));
    return;
  }
  next();
}
