import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ParsedDocument {
  text: string;
  pageCount: number;
  pages: { pageNumber: number; content: string }[];
}

export async function parseDocument(
  buffer: Buffer,
  fileName: string,
  fileType: string
): Promise<ParsedDocument> {
  const ext = fileType.toLowerCase().replace('.', '') || fileName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf') {
    try {
      const pdfData = await pdfParse(buffer);
      // Rough page splitter if raw pages not exposed directly
      const pageTexts = pdfData.text.split(/\n(?=(?:Page\s+\d+|\[Page\s+\d+\]|\f))/i);
      const pages = pageTexts.map((content, idx) => ({
        pageNumber: idx + 1,
        content: content.trim(),
      })).filter(p => p.content.length > 0);

      return {
        text: pdfData.text,
        pageCount: pdfData.numpages || (pages.length > 0 ? pages.length : 1),
        pages: pages.length > 0 ? pages : [{ pageNumber: 1, content: pdfData.text }],
      };
    } catch (err) {
      console.error('Error parsing PDF:', err);
      // Fallback text
      const fallbackText = buffer.toString('utf-8');
      return {
        text: fallbackText,
        pageCount: 1,
        pages: [{ pageNumber: 1, content: fallbackText }],
      };
    }
  }

  if (ext === 'docx') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      const chunks = text.split(/\n{3,}/);
      const pages = chunks.map((c, i) => ({ pageNumber: i + 1, content: c.trim() })).filter(p => p.content.length > 0);

      return {
        text,
        pageCount: pages.length || 1,
        pages: pages.length > 0 ? pages : [{ pageNumber: 1, content: text }],
      };
    } catch (err) {
      console.error('Error parsing DOCX:', err);
      const text = buffer.toString('utf-8');
      return { text, pageCount: 1, pages: [{ pageNumber: 1, content: text }] };
    }
  }

  // TXT / Markdown
  const text = buffer.toString('utf-8');
  const sections = text.split(/\n(?=#+\s)/);
  const pages = sections.map((s, i) => ({ pageNumber: i + 1, content: s.trim() })).filter(p => p.content.length > 0);

  return {
    text,
    pageCount: pages.length || 1,
    pages: pages.length > 0 ? pages : [{ pageNumber: 1, content: text }],
  };
}
