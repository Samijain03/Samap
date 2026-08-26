"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  FileText,
  Map,
  Award,
  Zap,
  CheckCircle2,
  BookmarkCheck,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function LandingHero() {
  const { demoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<"exam" | "roadmap" | "quiz">("exam");

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center space-y-8 relative z-10">
        {/* Brand Tag Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium backdrop-blur-md animate-in fade-in-50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Samap 2.0</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">by delusional club industries</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            The study companion for humans who want to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-indigo-200 to-emerald-300">
              master hard things.
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your university lecture notes and syllabus. Samap delivers verified answers citing exact page numbers, visual learning roadmaps, and 5-mark exam blueprints.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/signup">
            <Button
              size="lg"
              className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm md:text-base gap-2 shadow-xl shadow-brand-600/25 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" /> Start Studying Free
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            onClick={() => demoLogin("alex")}
            className="w-full sm:w-auto h-13 px-7 rounded-2xl border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm md:text-base gap-2 transition-all"
          >
            <span>⚡ Try 1-Click Demo Account</span>
          </Button>
        </div>

        {/* Key Selling Points Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Hallucination Course RAG</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-400" />
            <span>Interactive Node Roadmaps</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>5-Mark Exam Answers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Mobile-First iPhone Ready</span>
          </div>
        </div>

        {/* Live Interactive Product Simulator */}
        <div className="pt-8 max-w-4xl mx-auto">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 backdrop-blur-2xl shadow-2xl overflow-hidden text-left">
            {/* Window Top Bar */}
            <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">
                  samap.study / preview
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab("exam")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "exam" ? "bg-brand-600 text-white" : "text-slate-400"
                  }`}
                >
                  📝 Course RAG
                </button>
                <button
                  onClick={() => setActiveTab("roadmap")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "roadmap" ? "bg-emerald-600 text-white" : "text-slate-400"
                  }`}
                >
                  🗺️ Roadmaps
                </button>
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "quiz" ? "bg-amber-600 text-white" : "text-slate-400"
                  }`}
                >
                  ❓ Quiz Engine
                </button>
              </div>
            </div>

            {/* Interactive Tab Showcase Content */}
            <div className="p-6 md:p-8 space-y-4">
              {activeTab === "exam" && (
                <div className="space-y-4 animate-in fade-in-50">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                    <span className="font-semibold text-white">
                      💬 &ldquo;Explain Banker&apos;s Algorithm with a 5-mark exam answer&rdquo;
                    </span>
                    <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-mono">
                      EXAM MODE
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 space-y-3 leading-relaxed">
                    <div className="font-semibold text-white text-sm">
                      1. Definition & Safety Condition:
                    </div>
                    <p>
                      The <strong>Banker&apos;s Algorithm</strong> is a deadlock avoidance algorithm developed by Edsger Dijkstra. A state is safe if there exists a sequence $\langle P_1, P_2, \dots, P_n \rangle$ such that for each $P_i$:
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-brand-300 text-center text-[11px]">
                      {"$$\\text{Need}_i \\le \\text{Available} + \\sum_{j < i} \\text{Allocation}_j$$"}
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        Verified Source: Operating_Systems_Notes_Unit_1.pdf (Page 42)
                      </span>
                      <span className="font-mono text-slate-400">94% match</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "roadmap" && (
                <div className="space-y-3 animate-in fade-in-50">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>Machine Learning & Neural Networks Roadmap</span>
                    <span className="text-emerald-400">Step 3 of 5 In Progress</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-slate-200">
                      <div className="text-[10px] text-emerald-400 font-semibold uppercase">Completed</div>
                      <div className="font-medium text-white mt-1">1. Math for ML</div>
                      <div className="text-[11px] text-slate-400">Linear Algebra & Calculus</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-200 ring-1 ring-amber-500/20">
                      <div className="text-[10px] text-amber-400 font-semibold uppercase">In Progress</div>
                      <div className="font-medium text-white mt-1">2. Supervised Learning</div>
                      <div className="text-[11px] text-slate-400">Scikit-Learn & Regressions</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Next Milestone</div>
                      <div className="font-medium text-slate-300 mt-1">3. Deep Learning</div>
                      <div className="text-[11px] text-slate-500">PyTorch & CNNs</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "quiz" && (
                <div className="space-y-3 animate-in fade-in-50">
                  <div className="text-xs font-semibold text-white">
                    Question 1/5: Which condition is NOT a necessary Coffman condition for deadlock?
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      A. Mutual Exclusion
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500 text-emerald-300 font-medium">
                      B. Preemption Allowed ✓
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      C. Hold and Wait
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      D. Circular Wait
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
