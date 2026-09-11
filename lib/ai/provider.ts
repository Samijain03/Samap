import { GoogleGenerativeAI } from '@google/generative-ai';
import { SourceCitation, UserPreferences } from '@/lib/types';
import {
  generateMockRoadmap,
  generateMockQuiz,
  generateMockSyllabus,
  generateMockExamPaper,
  generateMockRoadmapChallenge,
} from './mock-data';

export interface GenerateChatOptions {
  prompt: string;
  history?: { role: 'user' | 'assistant' | 'system'; content: string }[];
  studyAction?: string;
  sources?: SourceCitation[];
  preferences?: UserPreferences | null;
  courseTitle?: string;
  subjectTitle?: string;
}

export class AIService {
  private geminiKey: string;
  private openaiKey: string;
  private groqKey: string;

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY || '';
    this.openaiKey = process.env.OPENAI_API_KEY || '';
    this.groqKey = process.env.GROQ_API_KEY || '';
  }

  private buildSystemPrompt(options: GenerateChatOptions): string {
    const action = options.studyAction?.toLowerCase() || '';
    const style = options.preferences?.learningStyle || 'balanced';
    const tone = options.preferences?.explanationTone || 'friendly';
    const alwaysExamples = options.preferences?.alwaysExamples !== false;

    let instructions = `You are Samap, the personal AI study companion and academic tutor developed by delusional club industries.
Your mission is to help the user master technical subjects, understand complex concepts deeply, prepare for university exams, and build real projects.

Tone: ${tone}
Learning Style Preference: ${style}
${alwaysExamples ? 'Always provide practical examples or code snippets when explaining concepts.' : ''}

Key Formatting Guidelines:
1. Use clean GitHub-flavored Markdown.
2. Render mathematical equations using standard LaTeX syntax ($inline$ or $$display$$).
3. Use fenced code blocks with language identifiers for all code.
4. Organize answers with clear headers, bold keywords, and bullet points.
`;

    if (action === 'exam-answer') {
      instructions += `\nCRITICAL: The user requested an EXAM-READY ANSWER.
Format the output for university exams:
- **Definition & Core Concept** (clear 1-2 sentence definition)
- **Key Characteristics / Components**
- **Formulas / Mathematical Representation** (if applicable)
- **Step-by-step Working / Diagrammatic Explanation**
- **Real-world Example**
- **Advantages & Disadvantages / Comparison Table**
Structure it precisely for 5-mark or 10-mark scoring criteria.`;
    } else if (action === 'summarize') {
      instructions += `\nCRITICAL: The user requested a SUMMARY. Provide a crisp, high-yield summary with key definitions, essential formulas, and key takeaways in bullet points.`;
    } else if (action === 'simplify') {
      instructions += `\nCRITICAL: The user requested SIMPLIFY (Explain Like I'm 5). Use intuitive analogies, everyday metaphors, and avoid dense jargon without sacrificing core correctness.`;
    } else if (action === 'examples') {
      instructions += `\nCRITICAL: Focus heavily on practical, concrete examples, realistic scenarios, and step-by-step code demonstrations.`;
    } else if (action === 'deep-dive') {
      instructions += `\nCRITICAL: Provide an advanced, in-depth deep dive. Analyze internal mechanics, memory/algorithmic complexity, edge cases, failure modes, and architectural trade-offs.`;
    }

    if (options.sources && options.sources.length > 0) {
      instructions += `\n\nCOURSE STUDY MATERIAL CONTEXT:
The user has provided their verified course materials below. PRIORITIZE THIS MATERIAL when answering questions. If citing facts from these documents, reference the source name and page number if available.

--- CONTEXT START ---
${options.sources
  .map(
    (s, idx) =>
      `[Source ${idx + 1}: ${s.fileName}${s.pageNumber ? `, Page ${s.pageNumber}` : ''}]\n${s.snippet}`
  )
  .join('\n\n')}
--- CONTEXT END ---
`;
    }

    return instructions;
  }

  /**
   * Generates a streaming chat response
   */
  async streamChat(
    options: GenerateChatOptions,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(options);

    // 1. Try Gemini if configured
    if (this.geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(this.geminiKey);
        const model = genAI.getGenerativeModel({
          model: options.preferences?.preferredModel || 'gemini-1.5-flash',
          systemInstruction: systemPrompt,
        });

        const contents = [
          ...(options.history || []).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          { role: 'user', parts: [{ text: options.prompt }] },
        ];

        const result = await model.generateContentStream({ contents });
        let fullResponse = '';

        for await (const chunk of result.stream) {
          const text = chunk.text();
          fullResponse += text;
          onChunk(text);
        }

        return fullResponse;
      } catch (err) {
        console.warn('Gemini API stream failed, falling back:', err);
      }
    }

    // 2. Intelligent Mock & Local Study Brain Fallback
    const fallbackResponse = this.generateIntelligentResponse(options);
    const words = fallbackResponse.split(' ');

    let fullResponse = '';
    for (let i = 0; i < words.length; i++) {
      const piece = words[i] + (i === words.length - 1 ? '' : ' ');
      fullResponse += piece;
      onChunk(piece);
      // Slight delay for realistic stream feel
      await new Promise(r => setTimeout(r, 12));
    }

    return fullResponse;
  }

  /**
   * Generates structured roadmap JSON
   */
  async generateRoadmap(topic: string, role?: string): Promise<any> {
    if (this.geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(this.geminiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `Generate a comprehensive, structured interactive learning roadmap for "${topic}"${
          role ? ` targeting the role of "${role}"` : ''
        }.
Return a JSON object adhering to this schema:
{
  "title": string,
  "targetRole": string,
  "category": string,
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedHours": number,
  "nodes": [
    {
      "title": string,
      "stage": "prerequisites" | "beginner" | "intermediate" | "advanced" | "tools",
      "order": number,
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "estimatedHours": string,
      "prerequisites": string[],
      "description": string,
      "keyConcepts": string[],
      "resources": [{ "title": string, "url": string, "type": "docs" | "video" | "article" | "book" }],
      "practiceTasks": string[],
      "projectIdeas": string[],
      "relatedTopics": string[]
    }
  ],
  "projects": [
    {
      "title": string,
      "level": "beginner" | "intermediate" | "advanced" | "expert",
      "objective": string,
      "requirements": string[],
      "skillsPracticed": string[],
      "estimatedTime": string,
      "architecture": string,
      "extensions": string[]
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
      } catch (err) {
        console.warn('Gemini Roadmap generation error:', err);
      }
    }

    return generateMockRoadmap(topic);
  }

  /**
   * Generates structured Quiz JSON
   */
  async generateQuiz(params: {
    topic: string;
    difficulty?: string;
    questionCount?: number;
    contextText?: string;
  }): Promise<any> {
    const { topic, difficulty = 'medium', questionCount = 5, contextText } = params;

    if (this.geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(this.geminiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `Generate an engaging study quiz with ${questionCount} questions on "${topic}" with difficulty "${difficulty}".
${contextText ? `Based strictly on this course material:\n${contextText}\n` : ''}

Return a JSON object with:
{
  "title": "Quiz: ${topic}",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "type": "mcq" | "true_false" | "short_answer",
      "question": string,
      "options": string[] (array of 4 strings for mcq, 2 for true_false, empty array for short_answer),
      "correctAnswer": string,
      "explanation": string,
      "points": number
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
      } catch (err) {
        console.warn('Gemini Quiz generation error:', err);
      }
    }

    return generateMockQuiz(topic, questionCount);
  }

  /**
   * Generates structured Syllabus & Curriculum JSON
   */
  async generateSyllabus(courseTitle: string, description?: string): Promise<any> {
    if (this.geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(this.geminiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `Generate a rigorous, university-level curriculum and syllabus breakdown for a course titled "${courseTitle}"${
          description ? ` with course description: "${description}"` : ''
        }.
Structure it into 3-4 cohesive Units/Subjects, each with 2-3 Chapters, and each Chapter with 2-4 specific, high-yield Topics with estimated study minutes and exam relevance (Essential, High, Medium).

Return JSON adhering to this schema:
{
  "title": string,
  "code": string,
  "description": string,
  "subjects": [
    {
      "title": string,
      "description": string,
      "chapters": [
        {
          "title": string,
          "topics": [
            {
              "title": string,
              "description": string,
              "estimatedMinutes": number,
              "examRelevance": "Essential" | "High" | "Medium"
            }
          ]
        }
      ]
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
      } catch (err) {
        console.warn('Gemini Syllabus generation error:', err);
      }
    }

    return generateMockSyllabus(courseTitle, description);
  }

  /**
   * Generates a complete University Mock Exam Paper
   */
  async generateMockExam(params: {
    courseTitle: string;
    courseCode?: string;
    topicsList?: string[];
    durationMinutes?: number;
    totalMarks?: number;
  }): Promise<any> {
    const { courseTitle, courseCode = 'ENG-401', topicsList, durationMinutes = 180, totalMarks = 100 } = params;

    if (this.geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(this.geminiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `Generate an authentic university semester final examination paper for "${courseTitle}" (Course Code: ${courseCode}).
Duration: ${durationMinutes} minutes, Total Marks: ${totalMarks}.
${topicsList && topicsList.length > 0 ? `Covering topics: ${topicsList.join(', ')}\n` : ''}

Structure the paper with:
1. Section A: 3 Conceptual / 2-Mark short questions.
2. Section B: 2 Analytical / 5-Mark structured questions with derivations/diagram guidelines.
3. Section C: 1-2 Comprehensive / 10-Mark design / problem solving questions.

For EVERY question, provide a complete 'modelAnswer' and 'markingRubric' array.

Return JSON adhering to this schema:
{
  "title": string,
  "courseTitle": string,
  "courseCode": string,
  "durationMinutes": number,
  "totalMarks": number,
  "instructions": string[],
  "sections": [
    {
      "sectionName": string,
      "description": string,
      "markPerQuestion": number,
      "questions": [
        {
          "id": string,
          "questionNumber": number,
          "question": string,
          "topicsCovered": string,
          "modelAnswer": string,
          "markingRubric": string[]
        }
      ]
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
      } catch (err) {
        console.warn('Gemini Mock Exam generation error:', err);
      }
    }

    return generateMockExamPaper(courseTitle, courseCode);
  }

  /**
   * Generates interactive practice challenge for a roadmap milestone
   */
  async generateRoadmapChallenge(nodeTitle: string): Promise<any> {
    if (this.geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(this.geminiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `Generate a practical, real-world coding and conceptual challenge for the topic "${nodeTitle}".
Return JSON adhering to this schema:
{
  "title": string,
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedMinutes": number,
  "problemStatement": string,
  "requirements": string[],
  "starterCode": string,
  "hints": string[],
  "solutionExplanation": string
}`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
      } catch (err) {
        console.warn('Gemini Roadmap Challenge generation error:', err);
      }
    }

    return generateMockRoadmapChallenge(nodeTitle);
  }


  /**
   * Generates smart, high-yield contextual study answers when running in keyless/offline demo mode
   */
  private generateIntelligentResponse(options: GenerateChatOptions): string {
    const p = options.prompt.toLowerCase();
    const action = options.studyAction?.toLowerCase() || '';

    // Check if answering from uploaded context
    if (options.sources && options.sources.length > 0) {
      const topSource = options.sources[0];
      return `### Based on your course material (**${topSource.fileName}**${
        topSource.pageNumber ? `, Page ${topSource.pageNumber}` : ''
      }):

${topSource.snippet}

---

### Detailed Conceptual Breakdown

1. **Core Understanding:**
   In your course syllabus, this concept is emphasized as a foundational pillar. It provides the mechanism for managing computational state and ensuring correct execution boundaries.

2. **Exam Key Points:**
   * **Mechanism:** Relies on deterministic state transitions and well-defined invariants.
   * **Complexity Analysis:** Typically evaluated with respect to space-time efficiency $\\mathcal{O}(\\log n)$ or $\\mathcal{O}(n)$ operations.
   * **Common Pitfalls:** Forgetting edge cases, unhandled exception states, or race conditions.

3. **Practical Code / Execution Model:**
\`\`\`typescript
// Example demonstration of the concept
function processStudyEntity<T>(input: T[]): T[] {
  console.log("Analyzing syllabus entity with length:", input.length);
  return input.filter(Boolean);
}
\`\`\`

> **Source Reference:**
> *Document:* \`${topSource.fileName}\`  
> *Section/Page:* ${topSource.pageNumber || 'Section 1.2'}`;
    }

    // Exam Answer Action
    if (action === 'exam-answer' || p.includes('exam') || p.includes('marks')) {
      return `### Exam-Ready Structured Answer: ${options.prompt.replace(/explain|what is|give me an exam answer for/gi, '').trim() || 'Core Topic'}

#### 1. Definition (1 Mark)
The concept refers to an essential mathematical or architectural abstraction designed to solve structured computational problems efficiently while ensuring deterministic correctness and consistency.

#### 2. Key Principles & Characteristics (2 Marks)
* **Invariant Preservation:** Ensures the data structure or process state remains valid before and after transitions.
* **Optimal Asymptotic Complexity:** 
  $$\\text{Time Complexity} = \\mathcal{O}(\\log N) \\quad \\text{or} \\quad \\mathcal{O}(N)$$
  $$\\text{Space Overhead} = \\mathcal{O}(1) \\text{ auxiliary storage}$$
* **Deterministic Guarantees:** Eliminates ambiguity and ensures reproducible behavior across execution environments.

#### 3. Step-by-Step Mechanism & Pseudocode (1.5 Marks)
\`\`\`python
def algorithm_demonstration(elements):
    """
    Standard exam-grade implementation demonstration
    """
    left, right = 0, len(elements) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if elements[mid] == target:
            return mid
        elif elements[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\`

#### 4. Comparison & Trade-offs (0.5 Marks)
| Feature | This Approach | Naive Alternative |
| :--- | :--- | :--- |
| **Time Efficiency** | $\\mathcal{O}(\\log N)$ | $\\mathcal{O}(N)$ |
| **Memory Requirement** | $\\mathcal{O}(1)$ | $\\mathcal{O}(N)$ |
| **Scalability** | High | Low |

> **Exam Tip:** Clearly state the base cases and boundary constraints when writing this on your answer sheet.`;
    }

    // Default friendly study explanation
    return `### Understanding ${options.prompt.replace(/explain|what is/gi, '').trim() || 'this Concept'}

Hello! Here is a clean and intuitive breakdown:

#### 1. Intuition & Analogy
Imagine you are organizing a massive library. Rather than searching through every single shelf one-by-one from scratch (linear search), you divide the library into clear categorized sections and halve the search space at each step. This exponential reduction is what makes this technique so powerful.

#### 2. Mathematical Foundation
The recurrence relation governing this behavior is expressed as:
$$T(n) = T\\left(\\frac{n}{2}\\right) + \\mathcal{O}(1)$$
Applying the Master Theorem yields an optimal time complexity of $T(n) = \\Theta(\\log n)$.

#### 3. Practical Example in Code
\`\`\`typescript
export function binarySearch<T>(array: T[], target: T): number {
  let low = 0;
  let high = array.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (array[mid] === target) return mid;
    if (array[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
\`\`\`

#### 4. Quick Action Options:
* Click **"Exam Answer"** below to convert this into a 5-mark university format.
* Click **"Quiz Me"** to test your understanding with practice questions.
* Click **"Deep Dive"** for memory architecture and edge cases.`;
  }
}

export const aiService = new AIService();
export default aiService;
