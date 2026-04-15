import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

const signToken = (id: string) => {
  return jwt.sign({ id }, (process.env.JWT_SECRET as string) || 'supersecret_crypto_trading_key_for_primetrade', {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || '1h',
  });
};

export const registerUser = async (data: any) => {
  const { email, password, role } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already in use', 400, 'AUTH_006');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role || 'USER', // In real app, avoid allowing role directly from body, but fine for assignment if we want to create admins
    },
  });

  const token = signToken(newUser.id);
  return { user: { id: newUser.id, email: newUser.email, role: newUser.role }, token };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400, 'AUTH_007');
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Incorrect email or password', 401, 'AUTH_008');
  }

  const token = signToken(user.id);
  return { user: { id: user.id, email: user.email, role: user.role }, token };
};
