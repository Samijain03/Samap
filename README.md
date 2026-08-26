<div align="center">

# 🎓 Samap — AI-Powered Personal Study Companion
### *by delusional club industries*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

**A modern, human-crafted full-stack AI study platform designed for PC and iPhone.**  
*Your personal AI university, tutor, roadmap builder, and exam study planner.*

[Features](#-key-features) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start) • [Deployment](#-deployment) • [API & RAG](#-rag--ai-pipeline)

</div>

---

## 🌟 Key Features

### 📚 Mode A — Course AI with Verified RAG Notes
* **Multi-Tiered Syllabus Hierarchy**: Organize your studies into `Course` → `Subject` → `Chapter` → `Topic`.
* **Universal Document Ingestion**: Upload **PDF**, **DOCX**, **TXT**, or **Markdown** lecture notes with background text parsing and chunking.
* **Semantic Vector Search & Citations**: Prioritizes your uploaded syllabus over generic internet fluff. Answers include exact source filenames, page numbers, and relevance scores (e.g. `[Source: Operating_Systems_Unit1.pdf, Page 42]`).
* **Study Action Presets**:
  * 💡 **Explain**: Clear conceptual intuition with real-world analogies.
  * 📝 **Exam Answer**: University-grade 5-mark and 10-mark structured answers with marking criteria, definitions, equations, diagrams, and tables.
  * 📄 **Summarize**: High-yield key takeaway bullet points.
  * 💻 **Give Examples**: Practical code demonstrations.
  * ❓ **Quiz Me**: Instant topic practice questions with hints.
  * ⚡ **Simplify (ELI5)**: Beginner-friendly intuitive metaphors.
  * 🔬 **Deep Dive**: Low-level memory architecture and algorithmic trade-offs.

---

### 🗺️ Mode B — Interactive Learning Roadmaps
* **Generative Roadmap Engine**: Enter any skill (*"Machine Learning"*, *"React"*, *"Cybersecurity"*, *"Computer Vision"*, *"Cloud Architecture"*) to generate a visual milestone pathway.
* **Interactive Node Flow**: Milestones categorized into *Prerequisites*, *Beginner*, *Intermediate*, *Advanced*, and *Tools*.
* **Node Detail Drawers**: Explanations, prerequisites, key concepts, curated docs/video links, practice exercises, and milestone status toggles (*Not Started → In Progress → Completed*).
* **Hands-on Project Blueprints**: Level-appropriate project ideas with requirements, skills practiced, and architectural blueprints.

---

### ⏱️ Integrated Study Science Tools
* **Focus & Flow Pomodoro Timer**: 25m Focus / 5m Break with session counter and study audio toggle.
* **Active Recall Flashcard Decks**: 3D flip cards with self-evaluation (*Again* / *Mastered*).
* **AI Quiz Hub (`/quizzes`)**: Customizable MCQs, True/False, and Short Answer questions with real-time timers, automatic grading, celebration confetti, and detailed answer explanations.
* **Study Analytics (`/analytics`)**: 7-day streak tracker, weekly study hours area chart, and subject mastery radar chart powered by Recharts.

---

### 🔐 Authentication & Mobile-First PWA
* **Real Authentication**: Complete registration, email/password login, JWT HTTP-only cookies, and session isolation.
* **1-Click Instant Demo Login**: Instant access as *Alex Rivera (CS Student)* or *Sarah Chen (AI Researcher)*.
* **Mobile-First PWA**: Responsive iPhone bottom navigation bar (`Home`, `Courses`, `AI Chat`, `Roadmaps`, `Profile`), touch-friendly targets, and dark mode.
* **Global Search (`Cmd+K` / `Ctrl+K`)**: Lightning-fast command palette across courses, topics, roadmaps, documents, and quizzes.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    Samap Web App                       │
                               │          Next.js 14/15 App Router + TypeScript         │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
             ┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
             │                                             │                                             │
             ▼                                             ▼                                             ▼
  ┌──────────────────────┐                     ┌──────────────────────┐                     ┌────────────────────────┐
  │   Client UI Layer    │                     │   Next.js API & SSR  │                     │   AI & RAG Engine      │
  │ • Tailwind CSS       │                     │ • App Router Handlers│                     │ • Multi-Provider Core  │
  │ • Radix UI Primitives│                     │ • Prisma ORM         │                     │   (Gemini, OpenAI,     │
  │ • Framer Motion      │◄───────────────────►│ • SQLite / PostgreSQL│◄───────────────────►│    Groq, Local Fallback│
  │ • KaTeX (Math Formulas│                    │ • JWT / Session Auth │                     │ • Chunking & Parser    │
  │ • Lucide Icons       │                     │ • Vector Sim Search  │                     │   (PDF, DOCX, TXT, MD) │
  │ • Recharts           │                     │ • Global Search      │                     │ • Cosine Vector Store  │
  │ • Mobile PWA Shell   │                     │ • File Upload Engine │                     │ • Citations & Prompts  │
  └──────────────────────┘                     └──────────────────────┘                     └────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: `v18.0.0` or higher (tested on `v20` / `v24`)
* **npm** or **pnpm** / **yarn**

### 1. Clone & Install
```bash
git clone https://github.com/your-username/samap-study-companion.git
cd samap-study-companion
npm install
```

### 2. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```

*(Note: Samap comes with an intelligent built-in local generative brain, so you can test all features immediately without any API keys! You can optionally add your `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY` in `.env` or in the in-app Settings page).*

### 3. Initialize Database & Seed Demo Data
```bash
npx prisma db push
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment

### Option A: Deploy on Vercel (Recommended)
1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set your environment variables (`JWT_SECRET`, optional `GEMINI_API_KEY`).
4. Vercel will automatically build and deploy using `vercel.json`.

### Option B: Docker Container Deployment
Run with Docker Compose:
```bash
docker-compose up -d --build
```
The application will be live at `http://localhost:3000`.

### Option C: Production Node.js Server (VPS / Cloud VM)
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```text
samap-study-companion/
├── app/
│   ├── api/
│   │   ├── auth/           # Login, Register, Logout, Session Me
│   │   ├── chat/           # SSE Streaming AI Chat & Conversations
│   │   ├── courses/        # Course & Subject CRUD
│   │   ├── documents/      # Multi-format PDF/DOCX Ingestion & Chunking
│   │   ├── roadmaps/       # AI Roadmap Generator & Node Status
│   │   ├── quizzes/        # Quiz Generator & Attempt Evaluation
│   │   ├── analytics/      # Performance & Mastery Stats
│   │   ├── search/         # Cmd+K Global Search
│   │   └── health/         # Healthcheck Endpoint
│   ├── chat/               # ChatGPT-Style Study Chat Page
│   ├── courses/            # Course & Syllabus Management Page
│   ├── roadmaps/           # Interactive Roadmap Canvas Page
│   ├── quizzes/            # Quiz Player & Revision Page
│   ├── analytics/          # Study Analytics Dashboard
│   ├── settings/           # Personalization & Model Settings
│   ├── login/              # Login Page with 1-Click Demo
│   ├── signup/             # Signup Registration Page
│   ├── layout.tsx          # Root Layout (Shell, Theme, Auth)
│   └── page.tsx            # Landing Page & Study Dashboard
├── components/
│   ├── chat/               # MarkdownRenderer (KaTeX), SourceCitations, ActionChips
│   ├── landing/            # LandingHero, ModeShowcase, LandingFooter
│   ├── layout/             # Sidebar, Header, MobileNav
│   ├── search/             # GlobalSearchModal
│   ├── study/              # PomodoroTimer, FlashcardsDeck
│   ├── theme/              # ThemeProvider
│   └── ui/                 # Button, Card, Dialog, Badge, Progress, Tabs, etc.
├── context/
│   └── AuthContext.tsx     # Global Auth & Session Provider
├── lib/
│   ├── ai/                 # AI Provider Core (Gemini, OpenAI, Groq, Fallback)
│   ├── rag/                # Document Parsers & Vector Similarity Store
│   ├── auth.ts             # JWT, Password Hashing & Cookie Utilities
│   ├── prisma.ts           # Prisma Singleton Client
│   ├── types.ts            # TypeScript Definitions
│   └── utils.ts            # Classnames, formatters, and colors
├── prisma/
│   ├── schema.prisma       # Relational Schema
│   └── seed.js             # Seed script with sample university courses
├── public/
│   └── manifest.json       # Mobile PWA Manifest
├── Dockerfile              # Production Multi-Stage Dockerfile
├── docker-compose.yml      # Docker Compose Config
├── vercel.json             # Vercel Deployment Config
└── README.md
```

---

## 🤝 Contributing & License

Built with ❤️ by **delusional club industries**.  
Distributed under the **MIT License**. Contributions, bug reports, and feature suggestions are always welcome!
