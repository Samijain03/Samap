"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  RotateCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
}

const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: "f-1",
    front: "What is the Time Complexity of Binary Search?",
    back: "O(log n) — The search space is divided in half at each step. Best case O(1), Worst case O(log n).",
    subject: "Data Structures",
  },
  {
    id: "f-2",
    front: "What are the 4 Coffman Conditions for Deadlock in OS?",
    back: "1. Mutual Exclusion\n2. Hold & Wait\n3. No Preemption\n4. Circular Wait",
    subject: "Operating Systems",
  },
  {
    id: "f-3",
    front: "What is the Sigmoid Activation Function equation?",
    back: "σ(z) = 1 / (1 + e^(-z))\nMaps any input into a probability range [0, 1].",
    subject: "Machine Learning",
  },
  {
    id: "f-4",
    front: "What is the difference between TCP and UDP?",
    back: "TCP is connection-oriented, reliable, with flow & error control.\nUDP is connectionless, fast, lightweight, and best for real-time streaming.",
    subject: "Computer Networks",
  },
  {
    id: "f-5",
    front: "What is Normalization in Database Design?",
    back: "Organizing data to minimize redundancy and avoid insertion, update, and deletion anomalies (1NF, 2NF, 3NF, BCNF).",
    subject: "Database Systems",
  },
];

function playSoftSound(freq: number) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (e) {}
}

export function FlashcardsDeck() {
  const [cards, setCards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  // New card dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newSubject, setNewSubject] = useState("");

  const card = cards[currentIdx] || cards[0];

  const handleNext = (mastered = false) => {
    if (mastered) {
      setMasteredCount((prev) => prev + 1);
      playSoftSound(880); // Higher chime for success
    } else {
      playSoftSound(440);
    }
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    playSoftSound(380);
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playSoftSound(520);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `f-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      subject: newSubject.trim() || "General",
    };

    setCards((prev) => [newCard, ...prev]);
    setCurrentIdx(0);
    setIsFlipped(false);
    setNewFront("");
    setNewBack("");
    setNewSubject("");
    setIsDialogOpen(false);
  };

  return (
    <div className="p-5 rounded-3xl border border-white/[0.08] bg-slate-950/70 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Active Recall Deck</h3>
            <p className="text-[11px] text-slate-400">Spaced Repetition System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] px-2.5 rounded-lg border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white gap-1"
              >
                <Plus className="w-3 h-3" /> Add Card
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-white">
                  Add Custom Flashcard
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCard} className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Subject / Category</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Question / Front</label>
                  <textarea
                    required
                    rows={2}
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="What is the concept or question to recall?"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Answer / Back</label>
                  <textarea
                    required
                    rows={3}
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="Provide the concise answer, formula, or definition..."
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Save Flashcard
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Badge variant="outline" className="text-[10px] text-slate-400 bg-slate-900/60 border-slate-800">
            {currentIdx + 1} / {cards.length}
          </Badge>
        </div>
      </div>

      {/* 3D Flip Card Area */}
      <div
        onClick={handleFlip}
        className="relative min-h-[160px] p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/[0.08] hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between group shadow-lg select-none active:scale-[0.99]"
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          <span className="text-emerald-400/90">{card?.subject || "General"}</span>
          <span className="text-brand-400 flex items-center gap-1 group-hover:text-brand-300">
            <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
            {isFlipped ? "Answer (Click to flip)" : "Question (Click to flip)"}
          </span>
        </div>

        <div className="py-3 text-center">
          {isFlipped ? (
            <p className="text-xs md:text-sm font-medium text-emerald-300 whitespace-pre-line leading-relaxed animate-in fade-in-50">
              {card?.back}
            </p>
          ) : (
            <p className="text-sm md:text-base font-semibold text-white leading-relaxed">
              {card?.front}
            </p>
          )}
        </div>

        <div className="text-[10px] text-slate-500 text-center">
          {isFlipped ? "Tap card to flip back" : "Tap card anywhere to reveal explanation"}
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
            <XCircle className="w-3.5 h-3.5" /> Review Again
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
