import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      (req as any)[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error as any).issues || (error as any).errors || [];
        const message = issues
          .map((e: any) => `${(e.path || []).join('.')}: ${e.message}`)
          .join(', ');
        next(new BadRequestError(message || 'Validation failed'));
      } else {
        next(error);
      }
    }
  };
}
