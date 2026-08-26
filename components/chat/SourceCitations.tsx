"use client";

import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp, ExternalLink, BookmarkCheck } from "lucide-react";
import { SourceCitation } from "@/lib/types";

interface SourceCitationsProps {
  sources: SourceCitation[];
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-800/80">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors py-1 px-2 rounded-lg hover:bg-slate-900/60"
      >
        <div className="flex items-center gap-1.5 text-brand-400">
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>
            {sources.length} Verified Course Source{sources.length > 1 ? "s" : ""} Used
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span>{expanded ? "Hide sources" : "View references"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 pl-2">
          {sources.map((source, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-slate-200 truncate">
                  <FileText className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="truncate">{source.fileName}</span>
                </div>
                {source.pageNumber && (
                  <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-semibold">
                    Page {source.pageNumber}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-900/50 p-2 rounded-lg border border-slate-800/40">
                &ldquo;{source.snippet}&rdquo;
              </p>
              {source.similarity && (
                <div className="text-[10px] text-emerald-400 font-medium">
                  {Math.round(source.similarity * 100)}% relevance match
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
