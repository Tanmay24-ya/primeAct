import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';

export const getTrades = async (query: any, user: { id: string, role: string }) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.TradeWhereInput = {};
  
  if (user.role !== 'ADMIN') {
    where.userId = user.id;
  }
  
  if (query.symbol) {
    where.symbol = { contains: query.symbol as string };
  }

  const orderBy: Prisma.TradeOrderByWithRelationInput = {};
  if (query.sort) {
    const sortField = query.sort as 'price' | 'quantity' | 'createdAt';
    const order = (query.order as string) === 'asc' ? 'asc' : 'desc';
    orderBy[sortField] = order;
  } else {
    orderBy.createdAt = 'desc';
  }

  const [trades, total] = await Promise.all([
    prisma.trade.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.trade.count({ where })
  ]);

  return {
    trades,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getTradeStats = async (user: { id: string, role: string }) => {
  const where: Prisma.TradeWhereInput = {};
  if (user.role !== 'ADMIN') {
    where.userId = user.id;
  }

  const aggregations = await prisma.trade.aggregate({
    where,
    _count: { id: true },
    _sum: { quantity: true },
    _avg: { price: true },
  });

  return {
    totalTrades: aggregations._count.id,
    totalVolume: aggregations._sum.quantity || 0,
    avgPrice: aggregations._avg.price || 0,
  };
};

export const createTrade = async (data: any, userId: string) => {
  return await prisma.trade.create({
    data: {
      symbol: data.symbol,
      quantity: Number(data.quantity),
      price: Number(data.price),
      userId
    }
  });
};

export const updateTrade = async (id: string, data: any, user: { id: string, role: string }) => {
  const trade = await prisma.trade.findUnique({ where: { id } });
  if (!trade) {
    throw new AppError('Trade not found', 404, 'TRADE_001');
  }

  if (trade.userId !== user.id && user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to update this trade', 403, 'TRADE_002');
  }

  return await prisma.trade.update({
    where: { id },
    data: {
      ...(data.symbol && { symbol: data.symbol }),
      ...(data.quantity && { quantity: Number(data.quantity) }),
      ...(data.price && { price: Number(data.price) }),
    },
  });
};

export const deleteTrade = async (id: string, user: { id: string, role: string }) => {
  const trade = await prisma.trade.findUnique({ where: { id } });
  if (!trade) {
    throw new AppError('Trade not found', 404, 'TRADE_001');
  }

  if (trade.userId !== user.id && user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to delete this trade', 403, 'TRADE_002');
  }

  await prisma.trade.delete({ where: { id } });
  return null;
};
