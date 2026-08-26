"use client";

import React from "react";
import Link from "next/link";
import { LandingHero } from "./LandingHero";
import { ModeShowcase } from "./ModeShowcase";
import { LandingFooter } from "./LandingFooter";
import { PomodoroTimer } from "@/components/study/PomodoroTimer";
import { FlashcardsDeck } from "@/components/study/FlashcardsDeck";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  GraduationCap,
  Layers,
  Cpu,
  Terminal,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function LandingPage() {
  const { demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-[#080c14] text-white selection:bg-brand-500/30 selection:text-brand-200">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/[0.08] bg-[#080c14]/80 backdrop-blur-2xl sticky top-0 z-50 px-4 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">Samap</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                by delusional club industries
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">
            Course RAG
          </a>
          <a href="#roadmaps" className="hover:text-white transition-colors">
            Roadmaps
          </a>
          <a href="#study-tools" className="hover:text-white transition-colors">
            Study Tools
          </a>
          <a href="#comparison" className="hover:text-white transition-colors">
            Why Samap
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white hover:bg-slate-900">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/25 transition-all active:scale-95"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Landing Sections */}
      <main className="space-y-16">
        <LandingHero />

        {/* Social Proof Bar */}
        <section className="border-y border-white/[0.06] bg-slate-950/40 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                Trusted by Ambitious Learners
              </p>
              <p className="text-sm font-medium text-slate-300">
                Helping thousands master complex engineering, data science, and CS subjects.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 text-xs font-mono tracking-wider">
              <span>STANFORD</span>
              <span>MIT</span>
              <span>BERKELEY</span>
              <span>CARNEGIE MELLON</span>
              <span>IIT BOMBAY</span>
            </div>
          </div>
        </section>

        <div id="features">
          <ModeShowcase />
        </div>

        {/* Built-in Study Tools Section */}
        <section id="study-tools" className="py-16 border-t border-white/[0.08] max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Built-In Cognitive Science
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Active Recall & Deep Work Built Right In
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Integrated Pomodoro focus sessions and automated flashcard decks generated directly from your uploaded syllabus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PomodoroTimer />
            <FlashcardsDeck />
          </div>
        </section>

        {/* Why Samap / Comparison Section */}
        <section id="comparison" className="py-16 border-t border-white/[0.08] bg-slate-950/60">
          <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Designed for Students, Not General Office Workers
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                See how Samap compares to generic chatbots for university exams and technical learning.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-slate-900/40 overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-slate-900/80 text-slate-300">
                    <th className="p-4 sm:p-5 font-semibold">Feature</th>
                    <th className="p-4 sm:p-5 font-semibold text-brand-400">Samap Companion</th>
                    <th className="p-4 sm:p-5 font-semibold text-slate-500">Generic Chatbots</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Syllabus & Lecture Notes RAG</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Multi-file vector search with page citations
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">Generic internet answers without citations</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">University 5/10-Mark Exam Answers</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Structured with equations, diagrams & criteria
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">Unstructured conversational essays</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Interactive Skill Roadmaps</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Visual nodes, resource links & project ideas
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">Plain bulleted text walls</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Study Science (Pomodoro & Recall)</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Built-in timer, streak tracker & flashcards
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">None</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-16 max-w-4xl mx-auto px-4 text-center">
          <div className="p-8 md:p-14 rounded-3xl bg-gradient-to-br from-brand-900/50 via-slate-900 to-indigo-950/50 border border-brand-500/30 shadow-2xl space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-300 border border-brand-500/40 mx-auto flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Ready to ace your semester and master new tech skills?
            </h2>
            <p className="text-sm md:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
              Start structuring your courses, generating roadmaps, and mastering exams with your personal AI university.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 h-12 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 active:scale-95 transition-all"
                >
                  Create Your Free Account
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => demoLogin("alex")}
                className="w-full sm:w-auto px-6 h-12 rounded-2xl border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-sm active:scale-95 transition-all"
              >
                ⚡ Instant 1-Click Demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
