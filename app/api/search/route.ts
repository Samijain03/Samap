import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GlobalSearchResult } from '@/lib/types';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ results: [] });

    const results: GlobalSearchResult[] = [];

    // 1. Search Courses
    const courses = await prisma.course.findMany({
      where: {
        userId: user.id,
        OR: [
          { title: { contains: query } },
          { code: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 5,
    });
    for (const c of courses) {
      results.push({
        id: c.id,
        title: c.title,
        subtitle: c.code ? `Course Code: ${c.code}` : 'Course',
        category: 'course',
        href: `/courses?courseId=${c.id}`,
      });
    }

    // 2. Search Topics
    const topics = await prisma.topic.findMany({
      where: {
        chapter: { subject: { course: { userId: user.id } } },
        title: { contains: query },
      },
      include: {
        chapter: {
          include: {
            subject: { include: { course: true } },
          },
        },
      },
      take: 5,
    });
    for (const t of topics) {
      results.push({
        id: t.id,
        title: t.title,
        subtitle: `${t.chapter.subject.course.title} › ${t.chapter.subject.title}`,
        category: 'topic' as any,
        href: `/courses?courseId=${t.chapter.subject.courseId}&subjectId=${t.chapter.subjectId}`,
      });
    }

    // 3. Search Documents
    const documents = await prisma.document.findMany({
      where: {
        userId: user.id,
        fileName: { contains: query },
      },
      take: 5,
    });
    for (const d of documents) {
      results.push({
        id: d.id,
        title: d.fileName,
        subtitle: `${d.pageCount} Pages • ${(d.fileSize / 1024).toFixed(0)} KB`,
        category: 'document',
        href: `/courses?docId=${d.id}`,
      });
    }

    // 4. Search Roadmaps
    const roadmaps = await prisma.roadmap.findMany({
      where: {
        userId: user.id,
        OR: [
          { title: { contains: query } },
          { category: { contains: query } },
          { targetRole: { contains: query } },
        ],
      },
      take: 5,
    });
    for (const r of roadmaps) {
      results.push({
        id: r.id,
        title: r.title,
        subtitle: `${r.difficulty} • ${r.estimatedHours}h`,
        category: 'roadmap',
        href: `/roadmaps?roadmapId=${r.id}`,
      });
    }

    // 5. Search Quizzes
    const quizzes = await prisma.quiz.findMany({
      where: {
        userId: user.id,
        OR: [{ title: { contains: query } }, { topic: { contains: query } }],
      },
      take: 5,
    });
    for (const q of quizzes) {
      results.push({
        id: q.id,
        title: q.title,
        subtitle: `Difficulty: ${q.difficulty}`,
        category: 'quiz',
        href: `/quizzes?quizId=${q.id}`,
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error during global search:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
