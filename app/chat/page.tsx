"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  BookOpen,
  Trash2,
  ChevronDown,
  RefreshCw,
  Loader2,
  GraduationCap,
  Bot,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { SourceCitations } from "@/components/chat/SourceCitations";
import { StudyActionChips } from "@/components/chat/StudyActionChips";
import { ChatMessage, ConversationItem, CourseItem, SourceCitation } from "@/lib/types";

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPrompt = searchParams.get("prompt");
  const initialAction = searchParams.get("action");
  const initialCourseId = searchParams.get("courseId");

  const [inputPrompt, setInputPrompt] = useState(initialPrompt || "");
  const [selectedAction, setSelectedAction] = useState<string | null>(initialAction || "explain");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || "");
  
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingSources, setStreamingSources] = useState<SourceCitation[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load initial courses and conversations
  useEffect(() => {
    async function loadData() {
      try {
        const [coursesRes, convsRes] = await Promise.all([
          fetch("/api/courses"),
          fetch("/api/chat/conversations"),
        ]);
        const coursesData = await coursesRes.json();
        const convsData = await convsRes.json();

        setCourses(coursesData.courses || []);
        const loadedConvs: ConversationItem[] = convsData.conversations || [];
        setConversations(loadedConvs);

        if (loadedConvs.length > 0 && !activeConversationId && !initialPrompt) {
          setActiveConversationId(loadedConvs[0].id);
          setMessages(loadedConvs[0].messages || []);
        }
      } catch (err) {
        console.error("Failed to load chat data:", err);
      }
    }
    loadData();
  }, []);

  // Auto-send if initialPrompt was passed via URL
  useEffect(() => {
    if (initialPrompt && !isStreaming) {
      sendMessage(initialPrompt, initialAction || "explain", initialCourseId || undefined);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const selectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`);
      const data = await res.json();
      if (data.conversation) {
        setMessages(
          (data.conversation.messages || []).map((m: any) => ({
            ...m,
            sources: m.sources ? JSON.parse(m.sources) : undefined,
          }))
        );
        setSelectedCourseId(data.conversation.courseId || "");
      }
    } catch (err) {
      console.error("Error loading conversation:", err);
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputPrompt("");
    inputRef.current?.focus();
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chat/conversations/${convId}`, { method: "DELETE" });
      const updated = conversations.filter((c) => c.id !== convId);
      setConversations(updated);
      if (activeConversationId === convId) {
        if (updated.length > 0) {
          selectConversation(updated[0].id);
        } else {
          startNewConversation();
        }
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const sendMessage = async (
    promptToSend?: string,
    actionOverride?: string,
    courseOverride?: string
  ) => {
    const prompt = promptToSend || inputPrompt;
    if (!prompt.trim() || isStreaming) return;

    const action = actionOverride !== undefined ? actionOverride : selectedAction;
    const courseId = courseOverride !== undefined ? courseOverride : selectedCourseId;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversationId || "temp",
      role: "user",
      content: prompt,
      studyAction: action || undefined,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setIsStreaming(true);
    setStreamingContent("");
    setStreamingSources([]);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          conversationId: activeConversationId || undefined,
          courseId: courseId || undefined,
          studyAction: action || undefined,
          history: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let retrievedSources: SourceCitation[] = [];
      let newConvId = activeConversationId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n\n");

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith("event: meta")) {
            const jsonStr = line.replace("event: meta\ndata: ", "");
            try {
              const meta = JSON.parse(jsonStr);
              if (meta.conversationId) {
                newConvId = meta.conversationId;
                setActiveConversationId(meta.conversationId);
              }
              if (meta.sources) {
                retrievedSources = meta.sources;
                setStreamingSources(meta.sources);
              }
            } catch (e) {}
          } else if (line.startsWith("event: chunk")) {
            const jsonStr = line.replace("event: chunk\ndata: ", "");
            try {
              const data = JSON.parse(jsonStr);
              if (data.text) {
                accumulated += data.text;
                setStreamingContent((prev) => prev + data.text);
              }
            } catch (e) {}
          } else if (line.startsWith("event: done")) {
            // Done
          }
        }
      }

      // Add final assistant message to list
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        conversationId: newConvId || "conv",
        role: "assistant",
        content: accumulated,
        sources: retrievedSources,
        studyAction: action || undefined,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");
      setStreamingSources([]);

      // Refresh conversations list
      const convsRes = await fetch("/api/chat/conversations");
      const convsData = await convsRes.json();
      setConversations(convsData.conversations || []);
    } catch (err) {
      console.error("Streaming error:", err);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Left Sidebar: Study Sessions (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col w-72 border-r border-slate-800/80 bg-slate-950/60 p-4 space-y-4 shrink-0">
        <Button
          onClick={startNewConversation}
          className="w-full bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold gap-2 shadow-md shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          New Study Session
        </Button>

        {/* Course Scope Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Study Context (RAG)
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full h-9 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">🌐 All Uploaded Notes (Global)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                📚 {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
            Recent Sessions
          </div>
          {conversations.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No previous sessions
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = activeConversationId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all group ${
                    isSelected
                      ? "bg-slate-900 text-white font-medium border border-slate-800"
                      : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquare className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950/40 relative">
        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-brand-500/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">
                  Samap AI Study Companion
                </h2>
                <p className="text-xs md:text-sm text-slate-400">
                  Ask conceptual questions, prepare for exams with 5-mark answers, or explore your uploaded course notes with verified citations.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-4 text-left">
                {[
                  {
                    title: "Explain Banker's Algorithm",
                    desc: "Exam-ready deadlock avoidance answer",
                    action: "exam-answer",
                  },
                  {
                    title: "What is Convolution in CNNs?",
                    desc: "Intuitive explanation with math formulas",
                    action: "explain",
                  },
                  {
                    title: "Summarize Supervised Learning",
                    desc: "High-yield bullet points & takeaways",
                    action: "summarize",
                  },
                  {
                    title: "Quiz me on Process States",
                    desc: "Practice MCQs from lecture notes",
                    action: "quiz-me",
                  },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputPrompt(sample.title);
                      setSelectedAction(sample.action);
                      sendMessage(sample.title, sample.action);
                    }}
                    className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-brand-500/40 text-left transition-all group"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-brand-300 transition-colors">
                      {sample.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{sample.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rendered Messages */}
          {messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={`flex gap-3 max-w-3xl mx-auto ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 md:p-5 max-w-[90%] md:max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                    : "bg-slate-900/90 border border-slate-800/80 text-slate-100 shadow-xl"
                }`}
              >
                {msg.studyAction && msg.role === "user" && (
                  <span className="inline-block px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-semibold uppercase mb-1.5">
                    {msg.studyAction}
                  </span>
                )}

                {msg.role === "user" ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                ) : (
                  <>
                    <MarkdownRenderer content={msg.content} />
                    {msg.sources && <SourceCitations sources={msg.sources} />}
                  </>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {/* Active Streaming Token Bubble */}
          {isStreaming && (
            <div className="flex gap-3 max-w-3xl mx-auto justify-start animate-in fade-in-50">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="rounded-2xl p-4 md:p-5 max-w-[90%] md:max-w-[85%] bg-slate-900/90 border border-slate-800/80 text-slate-100 shadow-xl">
                {streamingContent ? (
                  <>
                    <MarkdownRenderer content={streamingContent} />
                    {streamingSources.length > 0 && (
                      <SourceCitations sources={streamingSources} />
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-brand-300 py-1">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                    <span>Analyzing course notes and generating answer...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Box Area */}
        <div className="p-3 md:p-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Quick Action Preset Chips */}
            <StudyActionChips
              selectedAction={selectedAction}
              onSelectAction={setSelectedAction}
            />

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="relative flex items-center"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a course question, request an exam answer, or quiz me..."
                className="w-full resize-none py-3.5 pl-4 pr-14 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all max-h-32"
              />
              <Button
                type="submit"
                disabled={!inputPrompt.trim() || isStreaming}
                size="iconSm"
                className="absolute right-2.5 h-9 w-9 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 shadow-md"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading AI Study Companion...</p>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
