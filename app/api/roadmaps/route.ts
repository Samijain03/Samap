import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import aiService from '@/lib/ai/provider';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ roadmaps: [] });

    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: user.id },
      include: {
        nodes: {
          orderBy: { order: 'asc' },
        },
        projects: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const parsed = roadmaps.map(r => ({
      ...r,
      nodes: r.nodes.map(n => ({
        ...n,
        prerequisites: JSON.parse(n.prerequisites || '[]'),
        keyConcepts: JSON.parse(n.keyConcepts || '[]'),
        resources: JSON.parse(n.resources || '[]'),
        practiceTasks: JSON.parse(n.practiceTasks || '[]'),
        projectIdeas: JSON.parse(n.projectIdeas || '[]'),
        relatedTopics: JSON.parse(n.relatedTopics || '[]'),
      })),
      projects: r.projects.map(p => ({
        ...p,
        requirements: JSON.parse(p.requirements || '[]'),
        skillsPracticed: JSON.parse(p.skillsPracticed || '[]'),
        extensions: JSON.parse(p.extensions || '[]'),
      })),
    }));

    return NextResponse.json({ roadmaps: parsed });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    return NextResponse.json({ error: 'Failed to fetch roadmaps' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

    const body = await req.json();
    const { topic, role } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // 1. Generate structured roadmap using AI
    const generated = await aiService.generateRoadmap(topic, role);

    // 2. Save into Prisma database
    const roadmap = await prisma.roadmap.create({
      data: {
        userId: user.id,
        title: generated.title || `${topic} Roadmap`,
        targetRole: generated.targetRole || role || `${topic} Specialist`,
        category: generated.category || 'Software Engineering',
        difficulty: generated.difficulty || 'Intermediate',
        estimatedHours: generated.estimatedHours || 60,
        nodes: {
          create: (generated.nodes || []).map((node: any, idx: number) => ({
            title: node.title,
            stage: node.stage || 'beginner',
            order: idx + 1,
            status: idx === 0 ? 'in_progress' : 'not_started',
            difficulty: node.difficulty || 'Beginner',
            estimatedHours: node.estimatedHours || '4-6 hours',
            prerequisites: JSON.stringify(node.prerequisites || []),
            description: node.description || '',
            keyConcepts: JSON.stringify(node.keyConcepts || []),
            resources: JSON.stringify(node.resources || []),
            practiceTasks: JSON.stringify(node.practiceTasks || []),
            projectIdeas: JSON.stringify(node.projectIdeas || []),
            relatedTopics: JSON.stringify(node.relatedTopics || []),
          })),
        },
        projects: {
          create: (generated.projects || []).map((proj: any) => ({
            title: proj.title,
            level: proj.level || 'intermediate',
            objective: proj.objective || '',
            requirements: JSON.stringify(proj.requirements || []),
            skillsPracticed: JSON.stringify(proj.skillsPracticed || []),
            estimatedTime: proj.estimatedTime || '10 hours',
            architecture: proj.architecture || null,
            extensions: JSON.stringify(proj.extensions || []),
          })),
        },
      },
      include: {
        nodes: true,
        projects: true,
      },
    });

    // 3. Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: 'roadmap_progress',
        title: `Generated Roadmap: ${roadmap.title}`,
        details: `Created ${roadmap.nodes.length} interactive nodes and ${roadmap.projects.length} project blueprints`,
      },
    });

    const parsedResult = {
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

    return NextResponse.json({ roadmap: parsedResult }, { status: 201 });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 });
  }
}
