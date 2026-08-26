"use client";

import React, { useState } from "react";
import {
  Layers,
  RotateCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
}

const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: "f-1",
    front: "What is the Time Complexity of Binary Search?",
    back: "O(log n) because the search space is divided in half with each comparison.",
    subject: "Data Structures",
  },
  {
    id: "f-2",
    front: "What are the 4 Coffman Conditions for Deadlock?",
    back: "1. Mutual Exclusion\n2. Hold & Wait\n3. No Preemption\n4. Circular Wait",
    subject: "Operating Systems",
  },
  {
    id: "f-3",
    front: "What is the purpose of the Sigmoid function in Logistic Regression?",
    back: "It maps any real-valued number into a probability score between 0 and 1: σ(z) = 1 / (1 + e^(-z)).",
    subject: "Machine Learning",
  },
  {
    id: "f-4",
    front: "What does the React Fiber Reconciliation engine do?",
    back: "It provides incremental rendering with ability to pause, abort, or reuse units of work and assign priority to updates.",
    subject: "Modern React",
  },
];

export function FlashcardsDeck() {
  const [cards] = useState<Flashcard[]>(SAMPLE_FLASHCARDS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  const card = cards[currentIdx];

  const handleNext = (mastered = false) => {
    if (mastered) setMasteredCount((prev) => prev + 1);
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="p-5 rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Active Recall Deck</h3>
            <p className="text-[11px] text-slate-400">Spaced Repetition Flashcards</p>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] text-slate-400">
          Card {currentIdx + 1} of {cards.length}
        </Badge>
      </div>

      {/* 3D Flip Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative min-h-[160px] p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700/70 hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between group shadow-lg select-none"
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          <span>{card.subject}</span>
          <span className="text-brand-400 flex items-center gap-1 group-hover:text-brand-300">
            <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
            {isFlipped ? "Answer" : "Question (Click to flip)"}
          </span>
        </div>

        <div className="py-3 text-center">
          {isFlipped ? (
            <p className="text-xs md:text-sm font-medium text-emerald-300 whitespace-pre-line leading-relaxed animate-in fade-in-50">
              {card.back}
            </p>
          ) : (
            <p className="text-sm md:text-base font-semibold text-white leading-relaxed">
              {card.front}
            </p>
          )}
        </div>

        <div className="text-[10px] text-slate-500 text-center">
          {isFlipped ? "Did you recall this correctly?" : "Tap anywhere to reveal explanation"}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          className="rounded-xl border-slate-800 text-xs text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" /> Prev
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleNext(false)}
            variant="outline"
            className="rounded-xl border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs gap-1"
          >
            <XCircle className="w-3.5 h-3.5" /> Again
          </Button>

          <Button
            size="sm"
            onClick={() => handleNext(true)}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1 shadow-md shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNext(false)}
          className="rounded-xl border-slate-800 text-xs text-slate-400 hover:text-white"
        >
          Next <ChevronRight className="w-4 h-4 ml-0.5" />
        </Button>
      </div>
    </div>
  );
}
