import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  // Handle generic JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again!',
      errorCode: 'AUTH_002',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your token has expired. Please log in again!',
      errorCode: 'AUTH_003',
    });
  }

  logger.error('Unexpected Error: ', err);

  return res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    errorCode: 'SERVER_500',
  });
};
