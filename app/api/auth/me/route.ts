import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (sessionUser) {
      return NextResponse.json({
        user: {
          id: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          avatar: sessionUser.avatar,
          preferences: sessionUser.preferences,
        },
      });
    }

    // No session token present -> return null so landing page renders for guests
    return NextResponse.json({ user: null });
  } catch (error) {
    console.error('Error fetching me:', error);
    return NextResponse.json({ user: null });
  }
}
