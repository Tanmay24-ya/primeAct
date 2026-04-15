import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  const { user, token } = await authService.registerUser(req.body);
  res.status(201).json({ success: true, data: { user, token } });
};

export const login = async (req: Request, res: Response) => {
  const { user, token } = await authService.loginUser(req.body);
  res.status(200).json({ success: true, data: { user, token } });
};

export const getMe = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { user: req.user } });
};
