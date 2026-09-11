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
  Copy,
  Check,
  Square,
  Menu,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  BookmarkPlus,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { SourceCitations } from "@/components/chat/SourceCitations";
import { StudyActionChips } from "@/components/chat/StudyActionChips";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Voice Speech-to-Text state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Text-to-Speech Audio Read-Aloud state
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Flashcard Modal state
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [flashcardFront, setFlashcardFront] = useState("");
  const [flashcardBack, setFlashcardBack] = useState("");
  const [savingCard, setSavingCard] = useState(false);
  const [cardSavedSuccess, setCardSavedSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Auto resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputPrompt]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const selectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setMobileSidebarOpen(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
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
    setMobileSidebarOpen(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
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

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Voice Dictation (Speech-to-Text)
  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  // Audio Read-Aloud (Text-to-Speech)
  const toggleReadAloud = (text: string, messageId: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown formatting for clean audio reading
    const cleanText = text
      .replace(/#+\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`{1,3}[^`]*`{1,3}/g, "code block omitted")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/\$\$?[^\$]+\$\$?/g, "equation");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Open Save as Flashcard modal
  const handleOpenFlashcardModal = (userPromptText: string, aiAnswerText: string) => {
    setFlashcardFront(userPromptText || "Key Concept");
    // Extract first 2-3 sentences or definition
    const lines = aiAnswerText.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
    const conciseAnswer = lines.slice(0, 3).join("\n").replace(/\*\*/g, "");
    setFlashcardBack(conciseAnswer || aiAnswerText.substring(0, 200));
    setCardSavedSuccess(false);
    setFlashcardModalOpen(true);
  };

  const handleSaveFlashcard = async () => {
    if (!flashcardFront.trim() || !flashcardBack.trim()) return;
    try {
      setSavingCard(true);
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          front: flashcardFront,
          back: flashcardBack,
          courseId: selectedCourseId || undefined,
          topicTitle: flashcardFront.substring(0, 30),
        }),
      });
      if (res.ok) {
        setCardSavedSuccess(true);
        setTimeout(() => {
          setFlashcardModalOpen(false);
          setCardSavedSuccess(false);
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to save flashcard:", err);
    } finally {
      setSavingCard(false);
    }
  };

  // Export session as Markdown study notes
  const handleExportMarkdownNotes = () => {
    if (messages.length === 0) return;
    const title = conversations.find((c) => c.id === activeConversationId)?.title || "Study Session Notes";
    let md = `# ${title}\n\n*Generated with Samap AI Study Companion — ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    messages.forEach((msg, idx) => {
      if (msg.role === "user") {
        md += `## ❓ Question ${Math.floor(idx / 2) + 1}: ${msg.content}\n\n`;
      } else {
        md += `### 💡 AI Explanation\n\n${msg.content}\n\n`;
        if (msg.sources && msg.sources.length > 0) {
          md += `**Sources Consulted:**\n`;
          msg.sources.forEach((s) => {
            md += `- *${s.fileName}*${s.pageNumber ? ` (Page ${s.pageNumber})` : ""}\n`;
          });
          md += `\n`;
        }
        md += `---\n\n`;
      }
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
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
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Streaming error:", err);
      }
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
    <div className="flex h-[calc(100vh-4rem)] bg-[#080c14] overflow-hidden relative">
      {/* Left Sidebar: Study Sessions */}
      <div
        className={`${
          mobileSidebarOpen ? "flex" : "hidden"
        } lg:flex flex-col w-72 border-r border-white/[0.08] bg-slate-950/80 backdrop-blur-xl p-4 space-y-4 shrink-0 absolute lg:relative inset-y-0 left-0 z-30 shadow-2xl lg:shadow-none`}
      >
        <div className="flex items-center justify-between">
          <Button
            onClick={startNewConversation}
            className="flex-1 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold gap-2 shadow-md shadow-brand-600/20 mr-2"
          >
            <Plus className="w-4 h-4" />
            New Session
          </Button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        {/* Top Header Bar with Session Controls & Export */}
        <div className="px-4 py-2.5 border-b border-white/[0.08] bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Sessions</span>
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">
                {conversations.find((c) => c.id === activeConversationId)?.title || "Active Study Workspace"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportMarkdownNotes}
                className="h-8 text-xs border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white rounded-xl gap-1.5"
                title="Export session as Markdown notes"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Notes</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={startNewConversation}
              className="h-8 text-xs bg-brand-600 hover:bg-brand-500 text-white rounded-xl"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New
            </Button>
          </div>
        </div>

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
                  Ask conceptual questions, speak aloud with voice input, prepare for exams with 5-mark answers, or explore your uploaded course notes.
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
                    className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.08] hover:border-brand-500/40 text-left transition-all group active:scale-[0.98]"
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
                className={`rounded-2xl p-4 md:p-5 max-w-[90%] md:max-w-[85%] relative group ${
                  msg.role === "user"
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                    : "bg-slate-900/90 border border-white/[0.08] text-slate-100 shadow-xl"
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

                    {/* Action Toolbar on AI message */}
                    <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {/* Audio Read-Aloud */}
                        <button
                          onClick={() => toggleReadAloud(msg.content, msg.id)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                            speakingMessageId === msg.id
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                          title="Listen to explanation"
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        {/* Save as Flashcard */}
                        <button
                          onClick={() => {
                            const prevUserMsg = messages[i - 1]?.content || "Key Concept";
                            handleOpenFlashcardModal(prevUserMsg, msg.content);
                          }}
                          className="text-[11px] bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-brand-300 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                          title="Save as Active Recall Flashcard"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Flashcard</span>
                        </button>
                      </div>

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800 transition-all"
                        title="Copy markdown text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
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
              <div className="rounded-2xl p-4 md:p-5 max-w-[90%] md:max-w-[85%] bg-slate-900/90 border border-white/[0.08] text-slate-100 shadow-xl">
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
        <div className="p-3 md:p-4 border-t border-white/[0.08] bg-slate-950/80 backdrop-blur-xl shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Quick Action Preset Chips */}
            <StudyActionChips
              selectedAction={selectedAction}
              onSelectAction={setSelectedAction}
            />

            {/* Input Form with Voice Dictation */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="relative flex items-end"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? "Listening... Speak your question aloud..."
                    : "Ask a course question, speak with mic, or request an exam answer..."
                }
                className={`w-full resize-none py-3.5 pl-4 pr-24 rounded-2xl bg-slate-900/90 border text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all leading-normal ${
                  isListening
                    ? "border-rose-500/80 ring-2 ring-rose-500/30"
                    : "border-white/[0.08] focus:ring-brand-500/50 focus:border-brand-500"
                }`}
              />

              <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
                {/* Voice Dictation Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse ring-2 ring-rose-400 shadow-lg shadow-rose-600/40"
                      : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
                  }`}
                  title={isListening ? "Stop listening" : "Speak question (Voice Dictation)"}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-white" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {isStreaming ? (
                  <Button
                    type="button"
                    size="iconSm"
                    onClick={stopGenerating}
                    className="h-9 w-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md"
                    title="Stop generation"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!inputPrompt.trim()}
                    size="iconSm"
                    className="h-9 w-9 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 shadow-md transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Save as Flashcard Modal */}
      <Dialog open={flashcardModalOpen} onOpenChange={setFlashcardModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border border-slate-800 p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-brand-400" />
              Save to Active Recall Deck
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Transform this AI explanation into a Leitner spaced repetition flashcard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Front (Prompt / Question)</label>
              <input
                type="text"
                value={flashcardFront}
                onChange={(e) => setFlashcardFront(e.target.value)}
                placeholder="What is the concept or question?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Back (Answer / Core Key)</label>
              <textarea
                rows={4}
                value={flashcardBack}
                onChange={(e) => setFlashcardBack(e.target.value)}
                placeholder="Core definition, key equations, or bullet points..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>

            {cardSavedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Card successfully saved to your Spaced Repetition deck!</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFlashcardModalOpen(false)}
              className="border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveFlashcard}
              disabled={savingCard || cardSavedSuccess || !flashcardFront.trim() || !flashcardBack.trim()}
              className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold"
            >
              {savingCard ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Card"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
