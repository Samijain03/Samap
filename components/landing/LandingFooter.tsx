"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Heart, Github, Sparkles } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-md">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">Samap</span>
            <p className="text-[11px] text-slate-500">
              Crafted by delusional club industries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/courses" className="hover:text-white transition-colors">
            Courses
          </Link>
          <Link href="/roadmaps" className="hover:text-white transition-colors">
            Roadmaps
          </Link>
          <Link href="/chat" className="hover:text-white transition-colors">
            AI Companion
          </Link>
          <Link href="/quizzes" className="hover:text-white transition-colors">
            Quizzes
          </Link>
        </div>

        <div className="text-center sm:text-right text-[11px] text-slate-500">
          Open & Accessible AI Education • Free for all ambitious builders
        </div>
      </div>
    </footer>
  );
}
