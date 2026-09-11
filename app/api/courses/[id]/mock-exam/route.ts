import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { aiService } from '@/lib/ai/provider';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const courseId = params.id;
    const body = await req.json().catch(() => ({}));
    const { durationMinutes = 180, totalMarks = 100 } = body;

    const course = await prisma.course.findFirst({
      where: { id: courseId, userId: user.id },
      include: {
        subjects: {
          include: {
            chapters: {
              include: { topics: true },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const topicsList: string[] = [];
    course.subjects.forEach((s) => {
      s.chapters.forEach((c) => {
        c.topics.forEach((t) => {
          topicsList.push(t.title);
        });
      });
    });

    const examPaper = await aiService.generateMockExam({
      courseTitle: course.title,
      courseCode: course.code || undefined,
      topicsList: topicsList.slice(0, 15),
      durationMinutes,
      totalMarks,
    });

    return NextResponse.json({
      success: true,
      examPaper,
    });
  } catch (error) {
    console.error('Error generating mock exam:', error);
    return NextResponse.json({ error: 'Failed to generate mock exam paper' }, { status: 500 });
  }
}
