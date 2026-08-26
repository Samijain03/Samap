import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: params.id },
      include: {
        nodes: {
          orderBy: { order: 'asc' },
        },
        projects: true,
      },
    });

    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    const parsed = {
      ...roadmap,
      nodes: roadmap.nodes.map(n => ({
        ...n,
        prerequisites: JSON.parse(n.prerequisites || '[]'),
        keyConcepts: JSON.parse(n.keyConcepts || '[]'),
        resources: JSON.parse(n.resources || '[]'),
        practiceTasks: JSON.parse(n.practiceTasks || '[]'),
        projectIdeas: JSON.parse(n.projectIdeas || '[]'),
        relatedTopics: JSON.parse(n.relatedTopics || '[]'),
      })),
      projects: roadmap.projects.map(p => ({
        ...p,
        requirements: JSON.parse(p.requirements || '[]'),
        skillsPracticed: JSON.parse(p.skillsPracticed || '[]'),
        extensions: JSON.parse(p.extensions || '[]'),
      })),
    };

    return NextResponse.json({ roadmap: parsed });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return NextResponse.json({ error: 'Failed to fetch roadmap' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.roadmap.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    return NextResponse.json({ error: 'Failed to delete roadmap' }, { status: 500 });
  }
}
