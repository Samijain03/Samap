import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ cards: [] });

    const decks = await prisma.flashcardDeck.findMany({
      where: { userId: user.id },
      include: {
        cards: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { front, back, deckId, courseId, topicTitle } = body;

    if (!front || !back) {
      return NextResponse.json({ error: 'Front and back content required' }, { status: 400 });
    }

    let targetDeckId = deckId;

    if (!targetDeckId) {
      // Find or create a deck for this course/topic
      const title = topicTitle ? `Quick Recall: ${topicTitle}` : 'Personal Active Recall Deck';
      const existingDeck = await prisma.flashcardDeck.findFirst({
        where: {
          userId: user.id,
          courseId: courseId || null,
        },
      });

      if (existingDeck) {
        targetDeckId = existingDeck.id;
      } else {
        const newDeck = await prisma.flashcardDeck.create({
          data: {
            userId: user.id,
            courseId: courseId || null,
            title,
            topic: topicTitle || 'General Concepts',
          },
        });
        targetDeckId = newDeck.id;
      }
    }

    const card = await prisma.flashcard.create({
      data: {
        deckId: targetDeckId,
        front: front.trim(),
        back: back.trim(),
        level: 0,
        nextReview: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      card,
      deckId: targetDeckId,
    });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 });
  }
}
