export type LearningStyle = 'beginner' | 'technical' | 'exam-oriented' | 'practical' | 'balanced';
export type ExplanationTone = 'friendly' | 'academic' | 'concise' | 'socratic';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  preferences?: UserPreferences | null;
}

export interface UserPreferences {
  learningStyle: LearningStyle;
  explanationTone: ExplanationTone;
  alwaysExamples: boolean;
  preferredModel: string;
  customApiKey?: string | null;
  theme: string;
}

export interface TopicItem {
  id: string;
  chapterId: string;
  title: string;
  content?: string | null;
  completed: boolean;
  order: number;
}

export interface ChapterItem {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  topics: TopicItem[];
}

export interface DocumentItem {
  id: string;
  courseId?: string | null;
  subjectId?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  pageCount: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  createdAt: string;
}

export interface SubjectItem {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  chapters: ChapterItem[];
  documents: DocumentItem[];
}

export interface CourseItem {
  id: string;
  userId: string;
  title: string;
  code?: string | null;
  description?: string | null;
  color: string;
  icon: string;
  subjects: SubjectItem[];
  documents: DocumentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SourceCitation {
  documentId: string;
  fileName: string;
  pageNumber?: number;
  snippet: string;
  similarity?: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SourceCitation[];
  studyAction?: string;
  createdAt: string;
}

export interface ConversationItem {
  id: string;
  title: string;
  courseId?: string | null;
  subjectId?: string | null;
  mode: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export type RoadmapNodeStatus = 'not_started' | 'in_progress' | 'completed';

export interface ResourceLink {
  title: string;
  url: string;
  type: 'article' | 'video' | 'docs' | 'course' | 'book';
}

export interface RoadmapNodeItem {
  id: string;
  roadmapId: string;
  title: string;
  stage: 'prerequisites' | 'beginner' | 'intermediate' | 'advanced' | 'tools';
  order: number;
  status: RoadmapNodeStatus;
  difficulty: string;
  estimatedHours: string;
  prerequisites: string[];
  description: string;
  keyConcepts: string[];
  resources: ResourceLink[];
  practiceTasks: string[];
  projectIdeas: string[];
  relatedTopics: string[];
}

export interface RoadmapProjectItem {
  id: string;
  roadmapId: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  objective: string;
  requirements: string[];
  skillsPracticed: string[];
  estimatedTime: string;
  architecture?: string | null;
  extensions: string[];
}

export interface RoadmapItem {
  id: string;
  userId: string;
  title: string;
  targetRole?: string | null;
  category: string;
  difficulty: string;
  estimatedHours: number;
  nodes: RoadmapNodeItem[];
  projects: RoadmapProjectItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestionItem {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'code';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface QuizItem {
  id: string;
  title: string;
  subjectId?: string | null;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'exam';
  questions: QuizQuestionItem[];
  createdAt: string;
}

export interface QuizAttemptItem {
  id: string;
  quizId: string;
  score: number;
  maxScore: number;
  answers: Record<string, string>;
  feedback?: {
    weakTopics: string[];
    strongTopics: string[];
    suggestedRevision: string;
  };
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'chat' | 'roadmap_progress' | 'quiz_completed' | 'course_added' | 'file_uploaded';
  title: string;
  details?: string | null;
  createdAt: string;
}

export interface GlobalSearchResult {
  id: string;
  title: string;
  category: 'course' | 'subject' | 'document' | 'roadmap' | 'quiz' | 'conversation';
  subtitle?: string;
  href: string;
}
