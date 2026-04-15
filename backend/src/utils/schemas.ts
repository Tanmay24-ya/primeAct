import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['USER', 'ADMIN']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string(),
  }),
});

export const tradeSchema = z.object({
  body: z.object({
    symbol: z.string().min(2).max(10).toUpperCase(),
    quantity: z.number().positive('Quantity must be greater than 0'),
    price: z.number().positive('Price must be greater than 0'),
  }),
});
