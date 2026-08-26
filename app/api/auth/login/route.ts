import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, isDemo, demoAccount } = body;

    let user;

    // Handle 1-Click Demo Login
    if (isDemo || demoAccount) {
      const demoEmail =
        demoAccount === 'sarah'
          ? 'sarah.chen@delusional.edu'
          : 'alex.rivera@delusional.edu';

      user = await prisma.user.findUnique({
        where: { email: demoEmail },
        include: { preferences: true },
      });

      if (!user) {
        // Create demo account on the fly if needed
        user = await prisma.user.create({
          data: {
            name: demoAccount === 'sarah' ? 'Sarah Chen' : 'Alex Rivera',
            email: demoEmail,
            avatar:
              demoAccount === 'sarah'
                ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            preferences: {
              create: {
                learningStyle: demoAccount === 'sarah' ? 'technical' : 'balanced',
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
    } else {
      // Standard credentials login
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();

      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: { preferences: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      if (user.passwordHash) {
        const valid = await comparePassword(password, user.passwordHash);
        if (!valid) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }
      }
    }

    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });

    response.cookies.set('samap_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 });
  }
}
