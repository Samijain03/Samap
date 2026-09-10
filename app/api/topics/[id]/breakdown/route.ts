import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { searchCourseDocuments } from '@/lib/rag/vector-store';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

    const topic = await prisma.topic.findUnique({
      where: { id: params.id },
      include: {
        chapter: {
          include: {
            subject: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });

    // RAG vector search from uploaded notes for this course/subject
    let citations: any[] = [];
    try {
      citations = await searchCourseDocuments(topic.title, user.id, {
        courseId: topic.chapter.subject.courseId,
        subjectId: topic.chapter.subjectId,
        topK: 2,
      });
    } catch (e) {}

    const citationSnippet = citations.length > 0 ? citations[0].snippet : '';

    const breakdown = {
      topicId: topic.id,
      title: topic.title,
      courseTitle: topic.chapter.subject.course.title,
      subjectTitle: topic.chapter.subject.title,
      chapterTitle: topic.chapter.title,
      verifiedSource: citations.length > 0 ? citations[0] : null,
      intuition: {
        summary: `**${topic.title}** is a core university concept in *${topic.chapter.subject.title}*. It provides rigorous mathematical and algorithmic guarantees for system efficiency and resource allocation.`,
        keyAnalogy: `Think of **${topic.title}** like an air traffic control system: preventing collisions by allocating discrete runway slots dynamically based on deterministic priorities.`,
        corePrinciples: [
          'Guaranteed deterministic execution invariants',
          'Asymptotic bounds on runtime and memory overhead',
          'Elimination of starvation and deadlock anomalies',
        ],
      },
      examBlueprint: {
        markWeight: '5 / 10 Marks',
        markingScheme: [
          { marks: '1 Mark', item: 'Standard Definition & Context' },
          { marks: '2 Marks', item: 'Mathematical Formulation / Core Theorem' },
          { marks: '1 Mark', item: 'Worked Numerical or Code Trace Example' },
          { marks: '1 Mark', item: 'Trade-offs, Edge Cases & Practical Limitations' },
        ],
        idealAnswer: `### 1. Definition\n**${topic.title}** provides formal guarantees for state transitions under constrained resources.\n\n### 2. Mathematical Formulation\n$$\\Delta S = \\sum_{i=1}^{n} w_i \\cdot f(x_i) \\quad \\text{subject to } \\sum w_i = 1$$\n\n### 3. Key Algorithmic Steps\n1. **Initialization:** Verify precondition invariant.\n2. **State Check:** Check available resources $\\ge$ required demand.\n3. **Commit Phase:** Transition state safely.\n\n### 4. Edge Cases & Constraints\nSusceptible to high contention under asymmetric workloads.`,
      },
      quickCheck: [
        {
          question: `What is the primary operational objective of ${topic.title}?`,
          options: [
            'Maintain safe state invariants and minimize resource contention',
            'Maximize unconstrained speculative execution',
            'Bypass operating system kernel scheduling',
            'Disable mutex locking',
          ],
          correctAnswer: 'Maintain safe state invariants and minimize resource contention',
          explanation: 'It ensures deterministic safety invariants without causing starvation or deadlocks.',
        },
      ],
    };

    return NextResponse.json({ breakdown });
  } catch (error) {
    console.error('Error generating topic breakdown:', error);
    return NextResponse.json({ error: 'Failed to generate breakdown' }, { status: 500 });
  }
}
