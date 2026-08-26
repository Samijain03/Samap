import { SourceCitation } from '@/lib/types';
import prisma from '@/lib/prisma';

export interface ChunkItem {
  chunkIndex: number;
  pageNumber: number;
  content: string;
  tokenCount: number;
  embedding?: number[];
}

/**
 * Splits text into overlapping semantic chunks
 */
export function chunkText(
  pages: { pageNumber: number; content: string }[],
  chunkSize: number = 600,
  overlap: number = 100
): ChunkItem[] {
  const chunks: ChunkItem[] = [];
  let chunkIdx = 0;

  for (const page of pages) {
    const words = page.content.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
      const slice = words.slice(i, i + chunkSize);
      const content = slice.join(' ');
      if (content.trim().length < 20) continue;

      // Estimate tokens (~0.75 words per token)
      const tokenCount = Math.round(slice.length * 1.3);

      chunks.push({
        chunkIndex: chunkIdx++,
        pageNumber: page.pageNumber,
        content: content.trim(),
        tokenCount,
        embedding: generateSimpleEmbedding(content),
      });

      if (i + chunkSize >= words.length) break;
    }
  }

  return chunks;
}

/**
 * Creates a normalized frequency vector for term-based and semantic matching
 */
export function generateSimpleEmbedding(text: string, dimensions: number = 128): number[] {
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);

  if (words.length === 0) return vector;

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1;
  }

  // Normalize vector to unit length
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

/**
 * Computes Cosine Similarity between two unit vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

/**
 * Search the user's uploaded course documents for relevant chunks
 */
export async function searchCourseDocuments(
  query: string,
  userId: string,
  options?: {
    courseId?: string;
    subjectId?: string;
    topK?: number;
  }
): Promise<SourceCitation[]> {
  const topK = options?.topK || 4;
  const queryVector = generateSimpleEmbedding(query);
  const queryKeywords = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);

  // Fetch document chunks for this user filtered by course/subject if provided
  const chunks = await prisma.documentChunk.findMany({
    where: {
      document: {
        userId,
        ...(options?.courseId ? { courseId: options.courseId } : {}),
        ...(options?.subjectId ? { subjectId: options.subjectId } : {}),
      },
    },
    include: {
      document: true,
    },
  });

  if (chunks.length === 0) {
    return [];
  }

  // Score each chunk
  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    
    // 1. Vector cosine similarity
    if (chunk.embedding) {
      try {
        const vec = JSON.parse(chunk.embedding);
        score += cosineSimilarity(queryVector, vec) * 0.6;
      } catch (e) {
        // Fallback
      }
    }

    // 2. Keyword exact match boost
    const contentLower = chunk.content.toLowerCase();
    let keywordHits = 0;
    for (const kw of queryKeywords) {
      if (contentLower.includes(kw)) {
        keywordHits++;
      }
    }
    if (queryKeywords.length > 0) {
      score += (keywordHits / queryKeywords.length) * 0.4;
    }

    return {
      chunk,
      score,
    };
  });

  // Sort descending by score
  scoredChunks.sort((a, b) => b.score - a.score);

  // Filter out low scores (threshold 0.1) and map to citations
  return scoredChunks
    .filter(item => item.score > 0.08)
    .slice(0, topK)
    .map(item => ({
      documentId: item.chunk.documentId,
      fileName: item.chunk.document.fileName,
      pageNumber: item.chunk.pageNumber || undefined,
      snippet: item.chunk.content.slice(0, 300) + (item.chunk.content.length > 300 ? '...' : ''),
      similarity: Math.round(item.score * 100) / 100,
    }));
}
