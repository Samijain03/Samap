import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'samap-delusional-club-super-secret-key-2026';
const COOKIE_NAME = 'samap_auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSessionUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { preferences: true },
    });

    return user;
  } catch (err) {
    console.error('Session retrieval error:', err);
    return null;
  }
}

export async function getAuthenticatedUser() {
  const sessionUser = await getSessionUser();
  if (sessionUser) return sessionUser;

  // Fallback to demo user if present
  let fallback = await prisma.user.findFirst({
    include: { preferences: true },
  });

  if (!fallback) {
    fallback = await prisma.user.create({
      data: {
        id: 'demo-user-1',
        email: 'alex.rivera@delusional.edu',
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        preferences: {
          create: {
            learningStyle: 'balanced',
            explanationTone: 'friendly',
            alwaysExamples: true,
            preferredModel: 'gemini-1.5-flash',
            theme: 'dark',
          },
        },
      },
      include: { preferences: true },
    });
  }

  return fallback;
}
