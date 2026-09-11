import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { aiService } from '@/lib/ai/provider';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { courseTitle, description, courseId, saveToCourse } = body;

    if (!courseTitle || !courseTitle.trim()) {
      return NextResponse.json({ error: 'Course title is required' }, { status: 400 });
    }

    const syllabus = await aiService.generateSyllabus(courseTitle, description);

    let savedCourse = null;

    if (saveToCourse) {
      if (courseId) {
        // Append subjects & chapters to existing course
        const existingCourse = await prisma.course.findFirst({
          where: { id: courseId, userId: user.id },
        });

        if (existingCourse) {
          for (let sIdx = 0; sIdx < (syllabus.subjects || []).length; sIdx++) {
            const sub = syllabus.subjects[sIdx];
            await prisma.subject.create({
              data: {
                courseId: existingCourse.id,
                title: sub.title,
                description: sub.description || '',
                chapters: {
                  create: (sub.chapters || []).map((ch: any, cIdx: number) => ({
                    title: ch.title,
                    order: cIdx + 1,
                    topics: {
                      create: (ch.topics || []).map((tp: any, tIdx: number) => ({
                        title: tp.title,
                        content: tp.description || null,
                        completed: false,
                        order: tIdx + 1,
                      })),
                    },
                  })),
                },
              },
            });
          }

          savedCourse = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
              subjects: {
                include: {
                  chapters: {
                    include: { topics: true },
                  },
                  documents: true,
                },
              },
              documents: true,
            },
          });
        }
      } else {
        // Create new course with generated syllabus
        savedCourse = await prisma.course.create({
          data: {
            userId: user.id,
            title: syllabus.title || courseTitle,
            code: syllabus.code || courseTitle.substring(0, 3).toUpperCase() + '-101',
            description: syllabus.description || description || 'AI-Generated Course Syllabus',
            color: '#6366f1',
            icon: 'BookOpen',
            subjects: {
              create: (syllabus.subjects || []).map((sub: any) => ({
                title: sub.title,
                description: sub.description || '',
                chapters: {
                  create: (sub.chapters || []).map((ch: any, cIdx: number) => ({
                    title: ch.title,
                    order: cIdx + 1,
                    topics: {
                      create: (ch.topics || []).map((tp: any, tIdx: number) => ({
                        title: tp.title,
                        content: tp.description || null,
                        completed: false,
                        order: tIdx + 1,
                      })),
                    },
                  })),
                },
              })),
            },
          },
          include: {
            subjects: {
              include: {
                chapters: {
                  include: { topics: true },
                },
                documents: true,
              },
            },
            documents: true,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      syllabus,
      course: savedCourse,
    });
  } catch (error) {
    console.error('Error generating syllabus:', error);
    return NextResponse.json({ error: 'Failed to generate syllabus' }, { status: 500 });
  }
}
