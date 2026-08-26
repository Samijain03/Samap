import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ courses: [] });

    const courses = await prisma.course.findMany({
      where: { userId: user.id },
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
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { title, code, description, color, icon, initialSubject } = body;

    if (!title) {
      return NextResponse.json({ error: 'Course title is required' }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        userId: user.id,
        title,
        code: code || null,
        description: description || null,
        color: color || '#6366f1',
        icon: icon || 'BookOpen',
        ...(initialSubject
          ? {
              subjects: {
                create: {
                  title: initialSubject,
                  chapters: {
                    create: {
                      title: 'Chapter 1: Introduction',
                      order: 1,
                      topics: {
                        create: [
                          { title: 'Overview & Syllabus', completed: false, order: 1 },
                          { title: 'Core Terminology', completed: false, order: 2 },
                        ],
                      },
                    },
                  },
                },
              },
            }
          : {}),
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

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: 'course_added',
        title: `Created Course: ${title}`,
        details: `Added new course with code ${code || 'N/A'}`,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
