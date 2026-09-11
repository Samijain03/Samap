import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { aiService } from '@/lib/ai/provider';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { nodeTitle } = body;

    if (!nodeTitle) {
      return NextResponse.json({ error: 'Node title is required' }, { status: 400 });
    }

    const challenge = await aiService.generateRoadmapChallenge(nodeTitle);

    return NextResponse.json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error('Error generating roadmap challenge:', error);
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 });
  }
}
