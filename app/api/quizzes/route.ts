import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import aiService from '@/lib/ai/provider';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ quizzes: [] });

    const quizzes = await prisma.quiz.findMany({
      where: { userId: user.id },
      include: {
        questions: true,
        attempts: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = quizzes.map(q => ({
      ...q,
      questions: q.questions.map(qu => ({
        ...qu,
        options: qu.options ? JSON.parse(qu.options) : [],
      })),
    }));

    return NextResponse.json({ quizzes: parsed });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { topic, subjectId, difficulty = 'medium', questionCount = 5, contextText } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Generate Quiz
    const generated = await aiService.generateQuiz({
      topic,
      difficulty,
      questionCount: Number(questionCount),
      contextText,
    });

    const quiz = await prisma.quiz.create({
      data: {
        userId: user.id,
        title: generated.title || `Quiz: ${topic}`,
        topic: generated.topic || topic,
        subjectId: subjectId || null,
        difficulty: generated.difficulty || difficulty,
        questions: {
          create: (generated.questions || []).map((q: any) => ({
            type: q.type || 'mcq',
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : JSON.stringify([]),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            points: q.points || 1,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: 'quiz_completed',
        title: `Generated Quiz: ${quiz.title}`,
        details: `${quiz.questions.length} questions on ${topic}`,
      },
    });

    const parsedQuiz = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : [],
      })),
    };

    return NextResponse.json({ quiz: parsedQuiz }, { status: 201 });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
