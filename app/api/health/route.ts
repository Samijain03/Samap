import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    await prisma.user.count();
    const dbLatency = Date.now() - start;

    return NextResponse.json({
      status: 'healthy',
      app: 'Samap',
      organization: 'delusional club industries',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        latencyMs: dbLatency,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: err.message,
      },
      { status: 500 }
    );
  }
}
