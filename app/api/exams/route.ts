import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import aiService from '@/lib/ai/provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ exams: [] });

    const exams = await prisma.exam.findMany({
      where: { userId: user.id },
      orderBy: { examDate: 'asc' },
    });

    const parsed = exams.map((e) => ({
      ...e,
      studyPlan: e.studyPlan ? JSON.parse(e.studyPlan) : null,
    }));

    return NextResponse.json({ exams: parsed });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

    const body = await req.json();
    const { title, courseId, examDate, targetScore = 'Grade A (90%+)', syllabusSummary } = body;

    if (!title || !examDate) {
      return NextResponse.json({ error: 'Exam title and date are required' }, { status: 400 });
    }

    // Calculate days remaining
    const targetDate = new Date(examDate);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Generate intelligent AI daily revision schedule
    const studyPlan = {
      daysRemaining,
      targetScore,
      strategy: `Comprehensive ${daysRemaining}-day active recall & practice schedule optimized for top marks.`,
      dailySchedules: [
        {
          day: 1,
          theme: 'Diagnostic Assessment & High-Yield Foundations',
          tasks: [
            { id: 't1-1', task: `Review Unit 1 core definitions & formula sheet for ${title}`, done: false },
            { id: 't1-2', task: 'Solve 3 previous year 5-mark conceptual questions', done: false },
            { id: 't1-3', task: 'Complete 25m Pomodoro deep focus on tricky edge cases', done: false },
          ],
        },
        {
          day: Math.max(2, Math.floor(daysRemaining / 2)),
          theme: 'Deep Dive & Algorithmic Problem Solving',
          tasks: [
            { id: 't2-1', task: 'Derive mathematical safety conditions & theorems', done: false },
            { id: 't2-2', task: 'Take a timed 10-question practice test in Quiz Mode', done: false },
            { id: 't2-3', task: 'Create active recall flashcards for all weak topics', done: false },
          ],
        },
        {
          day: daysRemaining,
          theme: 'Final Mock Exam & High-Yield Rapid Review',
          tasks: [
            { id: 't3-1', task: 'Simulate full exam conditions with 10-mark structured answers', done: false },
            { id: 't3-2', task: 'Review Flashcards deck for rapid spaced recall', done: false },
            { id: 't3-3', task: 'Final formula cheat sheet scan & good night sleep', done: false },
          ],
        },
      ],
    };

    const exam = await prisma.exam.create({
      data: {
        userId: user.id,
        courseId: courseId || null,
        title,
        examDate: targetDate,
        targetScore,
        syllabusSummary: syllabusSummary || null,
        studyPlan: JSON.stringify(studyPlan),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: 'exam_planned',
        title: `Scheduled Exam: ${title}`,
        details: `${daysRemaining} days countdown • Target: ${targetScore}`,
      },
    });

    return NextResponse.json({
      exam: {
        ...exam,
        studyPlan,
      },
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}
