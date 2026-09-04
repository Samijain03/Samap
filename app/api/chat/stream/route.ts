import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import aiService from '@/lib/ai/provider';
import { searchCourseDocuments } from '@/lib/rag/vector-store';
import { SourceCitation, UserPreferences } from '@/lib/types';
import { getAuthenticatedUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const {
      prompt,
      conversationId,
      courseId,
      subjectId,
      studyAction,
      history = [],
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. Retrieve course/subject context if available
    let sources: SourceCitation[] = [];
    try {
      sources = await searchCourseDocuments(prompt, user.id, {
        courseId: courseId || undefined,
        subjectId: subjectId || undefined,
        topK: 4,
      });
    } catch (e) {
      console.warn('RAG document search failed:', e);
    }

    // 2. Ensure conversation exists
    let activeConvId = conversationId;
    if (!activeConvId) {
      const convTitle = prompt.length > 40 ? prompt.slice(0, 37) + '...' : prompt;
      const newConv = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: convTitle,
          courseId: courseId || null,
          subjectId: subjectId || null,
          mode: studyAction || 'general',
        },
      });
      activeConvId = newConv.id;
    }

    // 3. Save User message in DB
    await prisma.message.create({
      data: {
        conversationId: activeConvId,
        role: 'user',
        content: prompt,
        studyAction: studyAction || null,
      },
    });

    // 4. Create ReadableStream for SSE response
    const encoder = new TextEncoder();
    let accumulatedResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        // Send conversation ID and citations event first
        controller.enqueue(
          encoder.encode(
            `event: meta\ndata: ${JSON.stringify({
              conversationId: activeConvId,
              sources,
            })}\n\n`
          )
        );

        try {
          await aiService.streamChat(
            {
              prompt,
              history,
              studyAction,
              sources,
              preferences: user.preferences as unknown as UserPreferences,
            },
            (chunk: string) => {
              accumulatedResponse += chunk;
              controller.enqueue(
                encoder.encode(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`)
              );
            }
          );

          // Save Assistant message in DB
          await prisma.message.create({
            data: {
              conversationId: activeConvId,
              role: 'assistant',
              content: accumulatedResponse,
              sources: sources.length > 0 ? JSON.stringify(sources) : null,
              studyAction: studyAction || null,
            },
          });

          // Log Activity
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              type: 'chat',
              title: `Studied: ${prompt.slice(0, 35)}...`,
              details: studyAction ? `Used study mode: ${studyAction}` : undefined,
            },
          });

          controller.enqueue(encoder.encode(`event: done\ndata: [DONE]\n\n`));
          controller.close();
        } catch (err: any) {
          console.error('Error during AI streaming:', err);
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat stream API:', error);
    return NextResponse.json({ error: 'Chat stream failed' }, { status: 500 });
  }
}
