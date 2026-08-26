import { RoadmapItem, QuizItem } from '@/lib/types';

/**
 * Intelligent topic templates and generative fallback engine for Samap
 */
export function generateMockRoadmap(topic: string): Partial<RoadmapItem> {
  const cleanTopic = topic.trim();
  const lower = cleanTopic.toLowerCase();

  if (lower.includes('react') || lower.includes('frontend') || lower.includes('web')) {
    return {
      title: `${cleanTopic} Mastery Roadmap`,
      targetRole: 'Senior Frontend Engineer',
      category: 'Web Development',
      difficulty: 'Intermediate',
      estimatedHours: 90,
      nodes: [
        {
          id: 'node-1',
          roadmapId: 'temp',
          title: 'JavaScript Modern Fundamentals (ES6+)',
          stage: 'prerequisites',
          order: 1,
          status: 'completed',
          difficulty: 'Beginner',
          estimatedHours: '10-15 hours',
          prerequisites: ['HTML5 & CSS3 basics'],
          description: 'Deep dive into closures, prototypal inheritance, array methods (map, filter, reduce), async/await, promises, and modern ES module imports.',
          keyConcepts: ['Event Loop & Microtasks', 'Closures & Scope Chain', 'Destructuring & Spread Operator', 'Promises & Async/Await', 'Immutability'],
          resources: [
            { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org', type: 'docs' },
            { title: 'JavaScript.info Complete Guide', url: 'https://javascript.info', type: 'article' },
          ],
          practiceTasks: [
            'Write custom polyfills for Array.prototype.map and Promise.all',
            'Build an asynchronous rate-limiting request fetcher',
          ],
          projectIdeas: ['Pure JS Kanban Board with LocalStorage'],
          relatedTopics: ['TypeScript', 'DOM Manipulation', 'Web APIs'],
        },
        {
          id: 'node-2',
          roadmapId: 'temp',
          title: 'React Core Architecture & Hooks',
          stage: 'beginner',
          order: 2,
          status: 'in_progress',
          difficulty: 'Beginner',
          estimatedHours: '20-25 hours',
          prerequisites: ['JavaScript ES6+'],
          description: 'Understand the Virtual DOM, reconciliation algorithm (Fiber), JSX, component lifecycle, and essential hooks (useState, useEffect, useMemo, useCallback, useRef).',
          keyConcepts: ['Virtual DOM & Fiber Reconciliation', 'Unidirectional Data Flow', 'Hook Rules & Dependency Arrays', 'Lifting State Up', 'Custom Hooks'],
          resources: [
            { title: 'React Official Documentation', url: 'https://react.dev', type: 'docs' },
            { title: 'React Hooks in Action', url: 'https://react.dev/reference/react', type: 'article' },
          ],
          practiceTasks: [
            'Create a useDebounce and useLocalStorage custom hook',
            'Build an infinite scrolling virtualization list',
          ],
          projectIdeas: ['Interactive Spotify/YouTube Music Player Clone'],
          relatedTopics: ['State Management', 'Component Design Patterns'],
        },
        {
          id: 'node-3',
          roadmapId: 'temp',
          title: 'State Management & Server State',
          stage: 'intermediate',
          order: 3,
          status: 'not_started',
          difficulty: 'Intermediate',
          estimatedHours: '15-20 hours',
          prerequisites: ['React Hooks'],
          description: 'Compare and master modern state solutions: Zustand for client state, TanStack Query (React Query) for server caching and optimistic updates, and React Context.',
          keyConcepts: ['Client vs Server State', 'Stale-While-Revalidate Caching', 'Optimistic UI Updates', 'Zustand Store Slices', 'Mutation Handlers'],
          resources: [
            { title: 'TanStack Query Official Docs', url: 'https://tanstack.com/query', type: 'docs' },
            { title: 'Zustand State Guide', url: 'https://github.com/pmndrs/zustand', type: 'docs' },
          ],
          practiceTasks: [
            'Build a data grid with server pagination, filtering, and optimistic item deletion',
          ],
          projectIdeas: ['Real-Time Crypto & Stock Trading Dashboard'],
          relatedTopics: ['Redux Toolkit', 'Jotai', 'WebSocket Sync'],
        },
        {
          id: 'node-4',
          roadmapId: 'temp',
          title: 'Next.js App Router & Server Components',
          stage: 'advanced',
          order: 4,
          status: 'not_started',
          difficulty: 'Advanced',
          estimatedHours: '25-30 hours',
          prerequisites: ['React Core', 'Server State'],
          description: 'Harness React Server Components (RSC), streaming with Suspense, Server Actions, Dynamic Routing, Metadata SEO, and Edge Runtime caching strategies.',
          keyConcepts: ['Server vs Client Components', 'Streaming SSR & Suspense boundaries', 'Server Actions & Mutating Data', 'Route Handlers & Middleware', 'Incremental Static Regeneration (ISR)'],
          resources: [
            { title: 'Next.js 14/15 App Router Docs', url: 'https://nextjs.org/docs', type: 'docs' },
          ],
          practiceTasks: [
            'Build an authenticated full-stack CRUD application using Server Actions and Prisma',
          ],
          projectIdeas: ['SaaS Multi-Tenant Project Management App (like Linear)'],
          relatedTopics: ['Edge Functions', 'Tailwind CSS', 'Vercel Deployment'],
        },
      ],
      projects: [
        {
          id: 'proj-1',
          roadmapId: 'temp',
          title: 'Interactive Markdown Notes & Study Workspace',
          level: 'intermediate',
          objective: 'Build a fast Notion-like editor with live KaTeX preview, auto-save, and tag filtering.',
          requirements: ['TipTap or Lexical Editor', 'Zustand State', 'Tailwind typography', 'Dark mode'],
          skillsPracticed: ['React Hooks', 'Local Persistence', 'Complex UI State'],
          estimatedTime: '12 hours',
          architecture: 'Next.js 14 + Tailwind CSS + Lucide Icons',
          extensions: ['Add real-time collaboration with WebRTC'],
        },
        {
          id: 'proj-2',
          roadmapId: 'temp',
          title: 'Enterprise Analytics Dashboard with AI Insights',
          level: 'advanced',
          objective: 'Create a high-performance analytics web app with Recharts, CSV upload, and automated AI summary generation.',
          requirements: ['TanStack Query', 'Recharts integration', 'Server streaming AI answers', 'Responsive mobile layout'],
          skillsPracticed: ['Data Visualization', 'Streaming APIs', 'TypeScript'],
          estimatedTime: '24 hours',
          architecture: 'Next.js App Router + Prisma + Gemini API',
          extensions: ['Add export to PDF and scheduled email alerts'],
        },
      ],
    };
  }

  // Default generic high-quality technical roadmap generator
  return {
    title: `${cleanTopic} Comprehensive Roadmap`,
    targetRole: `${cleanTopic} Specialist`,
    category: 'Computer Science & Software',
    difficulty: 'Intermediate',
    estimatedHours: 80,
    nodes: [
      {
        id: 'node-1',
        roadmapId: 'temp',
        title: `Foundations & Core Principles of ${cleanTopic}`,
        stage: 'prerequisites',
        order: 1,
        status: 'completed',
        difficulty: 'Beginner',
        estimatedHours: '10-15 hours',
        prerequisites: ['Basic logical thinking', 'Familiarity with CLI'],
        description: `Understand the fundamental building blocks, terminology, problem domain, and environment setup for ${cleanTopic}.`,
        keyConcepts: ['Core Architecture', 'Syntax & Terminology', 'Tooling & Environment', 'Basic Workflows'],
        resources: [
          { title: `${cleanTopic} Getting Started Guide`, url: 'https://google.com', type: 'docs' },
          { title: 'Interactive Foundations Crash Course', url: 'https://youtube.com', type: 'video' },
        ],
        practiceTasks: [
          'Set up local development environment and run first test program',
          'Complete 5 fundamental syntax and problem-solving exercises',
        ],
        projectIdeas: [`${cleanTopic} Quick-Start CLI Tool`],
        relatedTopics: ['Fundamentals', 'Syntax', 'Tooling'],
      },
      {
        id: 'node-2',
        roadmapId: 'temp',
        title: `Intermediate Concepts & Practical Patterns`,
        stage: 'intermediate',
        order: 2,
        status: 'in_progress',
        difficulty: 'Intermediate',
        estimatedHours: '20-25 hours',
        prerequisites: [`Foundations of ${cleanTopic}`],
        description: `Explore design patterns, asynchronous workflows, performance optimization, and modular architecture in ${cleanTopic}.`,
        keyConcepts: ['Design Patterns', 'Data Structures & Flow', 'Error Handling', 'Performance Optimization'],
        resources: [
          { title: 'Best Practices and Idiomatic Patterns', url: 'https://dev.to', type: 'article' },
        ],
        practiceTasks: [
          'Refactor a monolithic script into a clean modular architecture',
          'Implement comprehensive automated unit tests',
        ],
        projectIdeas: [`Automated Data Processing Pipeline in ${cleanTopic}`],
        relatedTopics: ['Design Patterns', 'Testing', 'Clean Code'],
      },
      {
        id: 'node-3',
        roadmapId: 'temp',
        title: `Advanced Systems & Production Engineering`,
        stage: 'advanced',
        order: 3,
        status: 'not_started',
        difficulty: 'Advanced',
        estimatedHours: '25-30 hours',
        prerequisites: ['Intermediate Patterns'],
        description: `Scale your ${cleanTopic} systems for enterprise production: security hardening, concurrency, telemetry, and continuous deployment.`,
        keyConcepts: ['High Availability', 'Concurrency & Locking', 'Security Best Practices', 'CI/CD & Monitoring'],
        resources: [
          { title: 'Enterprise Architecture Blueprint', url: 'https://github.com', type: 'docs' },
        ],
        practiceTasks: [
          'Profile application memory and eliminate performance bottlenecks',
          'Deploy containerized service behind a reverse proxy with TLS',
        ],
        projectIdeas: [`Production-Grade Distributed System with ${cleanTopic}`],
        relatedTopics: ['Distributed Systems', 'Cloud Deployment', 'Observability'],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        roadmapId: 'temp',
        title: `${cleanTopic} Full-Stack Utility Application`,
        level: 'intermediate',
        objective: `Design and implement a complete functional solution solving a real-world productivity problem with ${cleanTopic}.`,
        requirements: ['Clean modular code', 'Input validation & error handling', 'Persistent storage', 'Automated tests'],
        skillsPracticed: ['Problem Solving', 'System Design', 'Testing'],
        estimatedTime: '15 hours',
        architecture: 'Client UI + REST/gRPC API + Database',
        extensions: ['Add real-time analytics telemetry'],
      },
    ],
  };
}

export function generateMockQuiz(topic: string, count: number = 5): Partial<QuizItem> {
  return {
    title: `Quiz: ${topic}`,
    topic,
    difficulty: 'medium',
    questions: [
      {
        id: 'q-1',
        type: 'mcq',
        question: `What is the primary advantage of utilizing ${topic} in modern software systems?`,
        options: [
          'Significantly improves modularity, maintainability, and scalability',
          'Guarantees 100% reduction in memory footprint regardless of implementation',
          'Eliminates the necessity for compiler optimization or runtime checks',
          'Replaces all underlying operating system kernel primitives',
        ],
        correctAnswer: 'Significantly improves modularity, maintainability, and scalability',
        explanation: `${topic} provides standardized abstractions and architectural isolation that simplify reasoning, testing, and team scalability.`,
        points: 1,
      },
      {
        id: 'q-2',
        type: 'true_false',
        question: `In ${topic}, proper resource cleanup and error boundaries are essential to prevent resource leaks and unexpected crashes.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Resource leaks (such as unclosed descriptors or stale subscriptions) will degrade system performance over time.',
        points: 1,
      },
      {
        id: 'q-3',
        type: 'mcq',
        question: `Which algorithmic time complexity is typically expected for an optimal lookup operation in a balanced structure?`,
        options: ['O(1) or O(log N)', 'O(N^2)', 'O(N!)', 'O(2^N)'],
        correctAnswer: 'O(1) or O(log N)',
        explanation: 'Hash maps achieve O(1) average lookup time, whereas balanced binary search trees (e.g. Red-Black trees) guarantee O(log N) worst-case lookup time.',
        points: 1,
      },
      {
        id: 'q-4',
        type: 'short_answer',
        question: `What term describes the technique of storing the result of an expensive function call and returning the cached result when the same inputs occur again?`,
        options: [],
        correctAnswer: 'Memoization (or Caching)',
        explanation: 'Memoization is an optimization technique used primarily to speed up computer programs by storing the results of expensive function calls.',
        points: 2,
      },
    ],
  };
}
