import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ note: null });

    const note = await prisma.topicNote.findFirst({
      where: {
        topicId: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error fetching topic note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

    const body = await req.json();
    const { content, summary } = body;

    const existing = await prisma.topicNote.findFirst({
      where: {
        topicId: params.id,
        userId: user.id,
      },
    });

    let note;
    if (existing) {
      note = await prisma.topicNote.update({
        where: { id: existing.id },
        data: {
          content,
          summary: summary || existing.summary,
        },
      });
    } else {
      note = await prisma.topicNote.create({
        data: {
          userId: user.id,
          topicId: params.id,
          content,
          summary: summary || null,
        },
      });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error saving topic note:', error);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}
