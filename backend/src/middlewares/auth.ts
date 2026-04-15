import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import prisma from '../utils/prisma';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401, 'AUTH_001'));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_crypto_trading_key_for_primetrade') as { id: string, iat: number, exp: number };

  const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401, 'AUTH_004'));
  }

  req.user = { id: currentUser.id, email: currentUser.email, role: currentUser.role };
  next();
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403, 'AUTH_005'));
    }
    next();
  };
};
