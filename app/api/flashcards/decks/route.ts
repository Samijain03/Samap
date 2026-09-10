import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ decks: [] });

    const decks = await prisma.flashcardDeck.findMany({
      where: { userId: user.id },
      include: {
        cards: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Error fetching flashcard decks:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcard decks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

    const body = await req.json();
    const { title, topic, courseId, cards = [] } = body;

    if (!title || !topic) {
      return NextResponse.json({ error: 'Deck title and topic are required' }, { status: 400 });
    }

    const deck = await prisma.flashcardDeck.create({
      data: {
        userId: user.id,
        courseId: courseId || null,
        title,
        topic,
        cards: {
          create: cards.map((c: any) => ({
            front: c.front,
            back: c.back,
            level: c.level || 0,
          })),
        },
      },
      include: { cards: true },
    });

    return NextResponse.json({ deck });
  } catch (error) {
    console.error('Error creating flashcard deck:', error);
    return NextResponse.json({ error: 'Failed to create flashcard deck' }, { status: 500 });
  }
}
