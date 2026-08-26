"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Map,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Flame,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModeShowcase() {
  return (
    <section className="py-16 md:py-24 border-t border-slate-800/80 bg-slate-950/40">
      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-20">
        {/* Mode A: Course RAG Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" /> Mode A — Course AI
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Trained on your syllabus. Not just generic internet fluff.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              When university exams test you on specific professor formulas, textbook definitions, and module questions, generic ChatGPT answers lose you marks. Samap ingests your PDF, DOCX, and lecture notes, vector-indexes every page, and cites the exact source.
            </p>

            <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Extracts tables, mathematical formulas, and lecture slide page numbers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant 5-mark and 10-mark structured answers with marking scheme criteria</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Chapter-by-chapter summaries and important exam questions</span>
              </li>
            </ul>
          </div>

          {/* Visual Comparison Card */}
          <div className="space-y-3">
            {/* Generic AI Box */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-rose-500/20 space-y-1.5 opacity-75">
              <div className="flex items-center justify-between text-[11px] text-rose-400 font-semibold">
                <span className="flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Generic Internet AI
                </span>
                <span>Hallucination Risk</span>
              </div>
              <p className="text-xs text-slate-400 italic">
                &ldquo;Here is a generic 8-paragraph internet essay without your course definitions or syllabus structure...&rdquo;
              </p>
            </div>

            {/* Samap Course AI Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950/40 border border-brand-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Samap Course Engine
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] font-mono">
                  VERIFIED RAG
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                <strong>Banker&apos;s Algorithm (Deadlock Avoidance):</strong> Exact 5-mark format based on your uploaded <em>Unit 1 Operating Systems Notes</em>:
              </p>
              <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono">
                <div>• Definition (1 Mark)</div>
                <div>• Safety Condition Equation (1.5 Marks)</div>
                <div>• Resource Matrix Data Structures (1.5 Marks)</div>
                <div>• Limitations & Edge Cases (1 Mark)</div>
              </div>
              <div className="text-[11px] text-brand-300 font-medium pt-1 border-t border-slate-800/80">
                📄 Cited from: Operating_Systems_Unit1.pdf (Page 42)
              </div>
            </div>
          </div>
        </div>

        {/* Mode B: Interactive Roadmaps Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Visual Roadmap Card */}
          <div className="order-2 lg:order-1 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Interactive Pathway
              </span>
              <span className="text-xs text-slate-400">80 Hours Total</span>
            </div>
            <div className="space-y-2.5">
              {[
                { step: "1. Prerequisites", desc: "Linear Algebra & Calculus", status: "Done", color: "text-emerald-400" },
                { step: "2. Foundations", desc: "NumPy, Pandas & EDA", status: "Done", color: "text-emerald-400" },
                { step: "3. Supervised ML", desc: "Classifiers & Regressions", status: "Active", color: "text-amber-400" },
                { step: "4. Deep Learning", desc: "PyTorch, CNNs & Vision", status: "Next", color: "text-slate-500" },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{s.step}</span>
                    <p className="text-[11px] text-slate-400">{s.desc}</p>
                  </div>
                  <span className={`text-[11px] font-semibold ${s.color}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Map className="w-3.5 h-3.5" /> Mode B — Skill Roadmaps
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Turn any technical ambition into an actionable roadmap.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Never get stuck in tutorial hell again. Type any skill—from <em>Computer Vision</em> to <em>Cybersecurity</em>—and Samap breaks it down into a visual sequence with real-world practice tasks and project blueprints.
            </p>

            <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Visual node stages (Prerequisites → Beginner → Advanced → Tools)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Curated resources, official docs, and practice task checklists</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI-generated project ideas tailored to your current milestone level</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
