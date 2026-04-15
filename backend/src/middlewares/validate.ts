import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((issue) => `${issue.path.join('.')} : ${issue.message}`).join(', ');
        return next(new AppError(message, 400, 'VAL_400'));
      }
      return next(error);
    }
  };
};
