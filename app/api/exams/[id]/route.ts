import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
    });

    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    return NextResponse.json({
      exam: {
        ...exam,
        studyPlan: exam.studyPlan ? JSON.parse(exam.studyPlan) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
    });

    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    const body = await req.json();
    const { taskId, done, status } = body;

    let updatedStudyPlan = exam.studyPlan;

    if (taskId && exam.studyPlan) {
      const plan = JSON.parse(exam.studyPlan);
      plan.dailySchedules?.forEach((day: any) => {
        day.tasks?.forEach((t: any) => {
          if (t.id === taskId) {
            t.done = done !== undefined ? done : !t.done;
          }
        });
      });
      updatedStudyPlan = JSON.stringify(plan);
    }

    const updated = await prisma.exam.update({
      where: { id: params.id },
      data: {
        studyPlan: updatedStudyPlan,
        status: status || exam.status,
      },
    });

    return NextResponse.json({
      exam: {
        ...updated,
        studyPlan: updated.studyPlan ? JSON.parse(updated.studyPlan) : null,
      },
    });
  } catch (error) {
    console.error('Error updating exam task:', error);
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

    await prisma.exam.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}
