import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: params.id },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const updated = await prisma.topic.update({
      where: { id: params.id },
      data: { completed: !topic.completed },
    });

    return NextResponse.json({ topic: updated });
  } catch (error) {
    console.error('Error toggling topic:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}
