import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: true,
        attempts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const parsed = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : [],
      })),
      attempts: quiz.attempts.map(a => ({
        ...a,
        answers: JSON.parse(a.answers || '{}'),
        feedback: a.feedback ? JSON.parse(a.feedback) : null,
      })),
    };

    return NextResponse.json({ quiz: parsed });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const body = await req.json();
    const { answers } = body; // Record<questionId, userAnswer>

    let totalScore = 0;
    let maxScore = 0;
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    quiz.questions.forEach(q => {
      maxScore += q.points;
      const userAns = (answers[q.id] || '').trim().toLowerCase();
      const correctAns = (q.correctAnswer || '').trim().toLowerCase();

      if (userAns === correctAns || (userAns.length > 2 && correctAns.includes(userAns))) {
        totalScore += q.points;
        strongTopics.push(q.question.slice(0, 30));
      } else {
        weakTopics.push(q.question.slice(0, 30));
      }
    });

    const percentage = Math.round((totalScore / (maxScore || 1)) * 100);
    const feedback = {
      weakTopics: weakTopics.slice(0, 3),
      strongTopics: strongTopics.slice(0, 3),
      suggestedRevision:
        percentage < 70
          ? `Focus on reviewing foundational principles for "${quiz.topic}" in your course notes.`
          : `Great job! You have strong mastery of "${quiz.topic}". Try an advanced level or project next!`,
    };

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: user.id,
        score: totalScore,
        maxScore,
        answers: JSON.stringify(answers),
        feedback: JSON.stringify(feedback),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: 'quiz_completed',
        title: `Completed ${quiz.title}`,
        details: `Score: ${totalScore}/${maxScore} (${percentage}%)`,
      },
    });

    return NextResponse.json({
      attempt: {
        ...attempt,
        answers,
        feedback,
        percentage,
      },
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return NextResponse.json({ error: 'Failed to submit quiz attempt' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

    await prisma.quiz.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
  }
}
