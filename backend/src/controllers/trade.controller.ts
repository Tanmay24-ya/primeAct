import { Request, Response } from 'express';
import * as tradeService from '../services/trade.service';

export const getTrades = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const data = await tradeService.getTrades(req.query, req.user);
  res.status(200).json({ success: true, data });
};

export const getTradeStats = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const data = await tradeService.getTradeStats(req.user);
  res.status(200).json({ success: true, data });
};

export const createTrade = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const data = await tradeService.createTrade(req.body, req.user.id);
  res.status(201).json({ success: true, data });
};

export const updateTrade = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const data = await tradeService.updateTrade(req.params.id as string, req.body, req.user);
  res.status(200).json({ success: true, data });
};

export const deleteTrade = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  await tradeService.deleteTrade(req.params.id as string, req.user);
  res.status(204).json({ success: true, data: null });
};
