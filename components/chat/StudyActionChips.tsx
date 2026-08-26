"use client";

import React from "react";
import {
  FileText,
  Sparkles,
  BookOpen,
  Code,
  HelpCircle,
  Zap,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface StudyAction {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

export const STUDY_ACTIONS: StudyAction[] = [
  {
    id: "explain",
    label: "Explain",
    icon: Sparkles,
    description: "Clear conceptual breakdown",
    color: "hover:border-brand-500/50 hover:bg-brand-500/10 text-brand-400",
  },
  {
    id: "exam-answer",
    label: "Exam Answer",
    icon: BookOpen,
    description: "5/10 mark university answer",
    color: "hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400",
  },
  {
    id: "summarize",
    label: "Summarize",
    icon: FileText,
    description: "High-yield bullet summary",
    color: "hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400",
  },
  {
    id: "examples",
    label: "Give Examples",
    icon: Code,
    description: "Code & practical cases",
    color: "hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400",
  },
  {
    id: "quiz-me",
    label: "Quiz Me",
    icon: HelpCircle,
    description: "Test your understanding",
    color: "hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400",
  },
  {
    id: "simplify",
    label: "Simplify (ELI5)",
    icon: Zap,
    description: "Beginner-friendly intuition",
    color: "hover:border-pink-500/50 hover:bg-pink-500/10 text-pink-400",
  },
  {
    id: "deep-dive",
    label: "Deep Dive",
    icon: Layers,
    description: "Low-level system mechanics",
    color: "hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400",
  },
];

interface StudyActionChipsProps {
  selectedAction: string | null;
  onSelectAction: (actionId: string) => void;
}

export function StudyActionChips({
  selectedAction,
  onSelectAction,
}: StudyActionChipsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
      {STUDY_ACTIONS.map((action) => {
        const Icon = action.icon;
        const isSelected = selectedAction === action.id;

        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelectAction(isSelected ? "" : action.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shrink-0 active:scale-95",
              isSelected
                ? "bg-brand-600 border-brand-500 text-white shadow-md shadow-brand-500/20"
                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white",
              !isSelected && action.color
            )}
            title={action.description}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
