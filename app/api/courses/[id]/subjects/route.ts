import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: 'Subject title is required' }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        courseId: params.id,
        title,
        description: description || null,
        chapters: {
          create: {
            title: 'Chapter 1: Foundations',
            order: 1,
            topics: {
              create: [
                { title: 'Core Concepts & Terminology', completed: false, order: 1 },
                { title: 'Key Principles & Techniques', completed: false, order: 2 },
              ],
            },
          },
        },
      },
      include: {
        chapters: {
          include: { topics: true },
        },
        documents: true,
      },
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
