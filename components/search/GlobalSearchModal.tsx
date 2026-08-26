"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Map, HelpCircle, FileText, MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GlobalSearchResult } from "@/lib/types";

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "course":
        return <BookOpen className="w-4 h-4 text-brand-400" />;
      case "roadmap":
        return <Map className="w-4 h-4 text-emerald-400" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case "document":
        return <FileText className="w-4 h-4 text-purple-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden border-slate-800 bg-slate-950/95 backdrop-blur-2xl">
        <div className="flex items-center px-4 border-b border-slate-800/80">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, topics, roadmaps, notes, quizzes..."
            className="w-full bg-transparent py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {loading && <Loader2 className="w-4 h-4 text-brand-400 animate-spin shrink-0" />}
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 && query.length >= 2 && !loading && (
            <div className="py-8 text-center text-sm text-slate-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.length === 0 && query.length < 2 && (
            <div className="py-6 px-4 text-xs text-slate-500">
              <p className="font-medium text-slate-400 mb-2">Quick Navigation</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelect("/courses")}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-left text-slate-300 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-brand-400" />
                  <span>My Courses</span>
                </button>
                <button
                  onClick={() => handleSelect("/roadmaps")}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-left text-slate-300 transition-colors"
                >
                  <Map className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Roadmaps</span>
                </button>
                <button
                  onClick={() => handleSelect("/chat")}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-left text-slate-300 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>AI Study Companion</span>
                </button>
                <button
                  onClick={() => handleSelect("/quizzes")}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-left text-slate-300 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Quiz Hub</span>
                </button>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((item) => (
                <button
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-slate-800 border border-slate-800">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-slate-400 truncate max-w-sm">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.category}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
