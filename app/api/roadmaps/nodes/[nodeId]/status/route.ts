import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  try {
    const body = await req.json();
    const { status } = body;

    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updatedNode = await prisma.roadmapNode.update({
      where: { id: params.nodeId },
      data: { status },
    });

    return NextResponse.json({ node: updatedNode });
  } catch (error) {
    console.error('Error updating node status:', error);
    return NextResponse.json({ error: 'Failed to update node status' }, { status: 500 });
  }
}
