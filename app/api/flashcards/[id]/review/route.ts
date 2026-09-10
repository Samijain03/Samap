import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

    const body = await req.json();
    const { mastered, level } = body;

    const card = await prisma.flashcard.findUnique({
      where: { id: params.id },
    });

    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 });

    let newLevel = card.level;
    if (level !== undefined) {
      newLevel = level;
    } else if (mastered) {
      newLevel = Math.min(3, card.level + 1);
    } else {
      newLevel = Math.max(0, card.level - 1);
    }

    // Calculate next review interval (SRS: Leitner schedule)
    const nextReview = new Date();
    if (newLevel === 1) nextReview.setDate(nextReview.getDate() + 1);
    else if (newLevel === 2) nextReview.setDate(nextReview.getDate() + 3);
    else if (newLevel === 3) nextReview.setDate(nextReview.getDate() + 7);

    const updated = await prisma.flashcard.update({
      where: { id: params.id },
      data: {
        level: newLevel,
        nextReview,
      },
    });

    return NextResponse.json({ card: updated });
  } catch (error) {
    console.error('Error updating flashcard review:', error);
    return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 });
  }
}
