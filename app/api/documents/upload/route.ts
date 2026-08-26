import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseDocument } from '@/lib/rag/parser';
import { chunkText } from '@/lib/rag/vector-store';

export async function POST(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const courseId = formData.get('courseId') as string | null;
    const subjectId = formData.get('subjectId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name;
    const fileType = fileName.split('.').pop()?.toLowerCase() || 'txt';
    const fileSize = file.size;

    // Check supported file types
    const supportedTypes = ['pdf', 'docx', 'txt', 'md', 'markdown'];
    if (!supportedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, TXT, or Markdown.' },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Parse document text and pages
    const parsed = await parseDocument(buffer, fileName, fileType);

    // 2. Chunk text and generate vector representations
    const chunks = chunkText(parsed.pages, 500, 80);

    // 3. Save Document in DB
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        courseId: courseId || null,
        subjectId: subjectId || null,
        fileName,
        fileType,
        fileSize,
        pageCount: parsed.pageCount,
        status: 'ready',
        chunks: {
          create: chunks.map(chunk => ({
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            content: chunk.content,
            embedding: chunk.embedding ? JSON.stringify(chunk.embedding) : null,
            tokenCount: chunk.tokenCount,
          })),
        },
      },
      include: {
        chunks: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: 'file_uploaded',
        title: `Uploaded ${fileName}`,
        details: `Processed ${parsed.pageCount} pages and indexed ${chunks.length} chunks for RAG`,
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        pageCount: document.pageCount,
        chunksIndexed: chunks.length,
        status: document.status,
      },
    });
  } catch (error) {
    console.error('Error processing document upload:', error);
    return NextResponse.json(
      { error: 'Failed to process document upload' },
      { status: 500 }
    );
  }
}
