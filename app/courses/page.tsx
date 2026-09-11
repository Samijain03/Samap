"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Plus,
  FileText,
  Upload,
  CheckCircle2,
  Circle,
  Sparkles,
  Award,
  Trash2,
  FolderOpen,
  FileUp,
  Loader2,
  ChevronDown,
  ChevronRight,
  Layers,
  FileCode,
  Edit3,
  BookmarkCheck,
  Printer,
  Copy,
  Check,
  Brain,
  HelpCircle,
  GraduationCap,
  Clock,
  Download,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CourseItem, SubjectItem, ChapterItem, TopicItem, DocumentItem } from "@/lib/types";
import { formatBytes } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";

function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get("courseId");

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [loading, setLoading] = useState(true);

  // New Course Modal State
  const [newCourseModalOpen, setNewCourseModalOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [initialSubjectName, setInitialSubjectName] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);

  // AI Auto-Generate Syllabus Modal State
  const [aiSyllabusModalOpen, setAiSyllabusModalOpen] = useState(false);
  const [syllabusPrompt, setSyllabusPrompt] = useState("");
  const [generatingSyllabus, setGeneratingSyllabus] = useState(false);
  const [generatedSyllabusPreview, setGeneratedSyllabusPreview] = useState<any>(null);

  // AI Mock Exam Simulator State
  const [mockExamModalOpen, setMockExamModalOpen] = useState(false);
  const [generatingMockExam, setGeneratingMockExam] = useState(false);
  const [mockExamPaper, setMockExamPaper] = useState<any>(null);
  const [examDurationMins, setExamDurationMins] = useState(180);
  const [examTotalMarks, setExamTotalMarks] = useState(100);
  const [examSecondsLeft, setExamSecondsLeft] = useState(180 * 60);
  const [isExamTimerActive, setIsExamTimerActive] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [showModelSolutions, setShowModelSolutions] = useState(false);
  const [copiedExamMd, setCopiedExamMd] = useState(false);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Topic Study Studio Modal State
  const [studyStudioOpen, setStudyStudioOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState<TopicItem | null>(null);
  const [topicBreakdown, setTopicBreakdown] = useState<any>(null);
  const [topicNoteContent, setTopicNoteContent] = useState("");
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [activeStudioTab, setActiveStudioTab] = useState<"breakdown" | "notes" | "quickcheck">("breakdown");

  // Cheat Sheet Modal State
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [cheatSheetContent, setCheatSheetContent] = useState("");
  const [loadingCheatSheet, setLoadingCheatSheet] = useState(false);
  const [copiedCheatSheet, setCopiedCheatSheet] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Exam Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExamTimerActive && examSecondsLeft > 0) {
      interval = setInterval(() => {
        setExamSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExamTimerActive, examSecondsLeft]);

  async function fetchCourses() {
    try {
      setLoading(true);
      const res = await fetch("/api/courses");
      const data = await res.json();
      const fetchedCourses: CourseItem[] = data.courses || [];
      setCourses(fetchedCourses);

      if (fetchedCourses.length > 0) {
        const found = initialCourseId
          ? fetchedCourses.find((c) => c.id === initialCourseId)
          : fetchedCourses[0];
        const active = found || fetchedCourses[0];
        setSelectedCourse(active);
        if (active.subjects && active.subjects.length > 0) {
          setSelectedSubject(active.subjects[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    try {
      setCreatingCourse(true);
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseTitle,
          code: courseCode,
          description: courseDesc,
          initialSubject: initialSubjectName || "General Foundations",
        }),
      });

      const data = await res.json();
      if (data.course) {
        setCourses([data.course, ...courses]);
        setSelectedCourse(data.course);
        setSelectedSubject(data.course.subjects?.[0] || null);
        setNewCourseModalOpen(false);
        setCourseTitle("");
        setCourseCode("");
        setCourseDesc("");
        setInitialSubjectName("");
      }
    } catch (err) {
      console.error("Error creating course:", err);
    } finally {
      setCreatingCourse(false);
    }
  };

  // AI Auto-Generate Syllabus & Apply
  const handleGenerateSyllabus = async () => {
    if (!syllabusPrompt.trim()) return;
    try {
      setGeneratingSyllabus(true);
      const res = await fetch("/api/courses/generate-syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle: syllabusPrompt,
          courseId: selectedCourse?.id,
          saveToCourse: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedSyllabusPreview(data.syllabus);
        await fetchCourses();
        setTimeout(() => {
          setAiSyllabusModalOpen(false);
          setGeneratedSyllabusPreview(null);
          setSyllabusPrompt("");
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to generate syllabus:", err);
    } finally {
      setGeneratingSyllabus(false);
    }
  };

  // AI Mock Exam Generator
  const handleOpenMockExam = async () => {
    if (!selectedCourse) return;
    setMockExamModalOpen(true);
    setGeneratingMockExam(true);
    setShowModelSolutions(false);
    setStudentAnswers({});
    setExamSecondsLeft(examDurationMins * 60);
    setIsExamTimerActive(false);

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/mock-exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: examDurationMins,
          totalMarks: examTotalMarks,
        }),
      });
      const data = await res.json();
      if (data.examPaper) {
        setMockExamPaper(data.examPaper);
        setIsExamTimerActive(true);
      }
    } catch (err) {
      console.error("Failed to generate mock exam:", err);
    } finally {
      setGeneratingMockExam(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedCourse) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("courseId", selectedCourse.id);
      if (selectedSubject) {
        formData.append("subjectId", selectedSubject.id);
      }

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
          setUploadModalOpen(false);
          setSelectedFile(null);
          fetchCourses();
        }, 1200);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this document?")) return;
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      fetchCourses();
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const toggleTopicCompletion = async (topicId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/topics/${topicId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      const data = await res.json();
      if (data.topic && selectedCourse) {
        const updatedSubjects = selectedCourse.subjects.map((sub) => ({
          ...sub,
          chapters: sub.chapters.map((ch) => ({
            ...ch,
            topics: ch.topics.map((t) => (t.id === topicId ? { ...t, completed: !currentStatus } : t)),
          })),
        }));
        setSelectedCourse({ ...selectedCourse, subjects: updatedSubjects });
        setCourses(courses.map((c) => (c.id === selectedCourse.id ? { ...c, subjects: updatedSubjects } : c)));
      }
    } catch (err) {
      console.error("Error toggling topic completion:", err);
    }
  };

  const openStudyStudio = async (topic: TopicItem) => {
    setActiveTopic(topic);
    setStudyStudioOpen(true);
    setLoadingBreakdown(true);
    setActiveStudioTab("breakdown");

    try {
      const [breakdownRes, noteRes] = await Promise.all([
        fetch(`/api/topics/${topic.id}/breakdown`),
        fetch(`/api/topics/${topic.id}/notes`),
      ]);

      const breakdownData = await breakdownRes.json();
      const noteData = await noteRes.json();

      setTopicBreakdown(breakdownData.breakdown || null);
      setTopicNoteContent(noteData.note?.content || "");
    } catch (err) {
      console.error("Failed to load topic studio:", err);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const saveTopicNote = async () => {
    if (!activeTopic) return;
    try {
      setSavingNote(true);
      await fetch(`/api/topics/${activeTopic.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: topicNoteContent }),
      });
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSavingNote(false);
    }
  };

  const openCheatSheet = async () => {
    if (!selectedCourse) return;
    setCheatSheetOpen(true);
    setLoadingCheatSheet(true);

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/cheatsheet`);
      const data = await res.json();
      setCheatSheetContent(data.markdown || "");
    } catch (err) {
      console.error("Failed to fetch cheatsheet:", err);
    } finally {
      setLoadingCheatSheet(false);
    }
  };

  const copyCheatSheet = () => {
    navigator.clipboard.writeText(cheatSheetContent);
    setCopiedCheatSheet(true);
    setTimeout(() => setCopiedCheatSheet(false), 2000);
  };

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${s < 10 ? "0" : ""}${s}`;
    }
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  const getCourseCompletion = (course: CourseItem) => {
    const allTopics = course.subjects?.flatMap((s) => s.chapters?.flatMap((c) => c.topics) || []) || [];
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter((t) => t.completed).length;
    return Math.round((completed / allTopics.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your courses & study materials...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in-50 duration-300">
      {/* Header with Title & Add Course */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">My Courses & Syllabus</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Organize subjects, upload lecture notes/PDFs, generate full syllabi, and simulate university mock exams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setAiSyllabusModalOpen(true)}
            variant="outline"
            className="rounded-xl border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs md:text-sm font-medium gap-1.5"
          >
            <Wand2 className="w-4 h-4 text-purple-400" />
            AI Syllabus Builder
          </Button>

          <Button
            onClick={() => setUploadModalOpen(true)}
            variant="outline"
            className="rounded-xl border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs md:text-sm font-medium gap-1.5"
            disabled={!selectedCourse}
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            Upload PDF / Notes
          </Button>

          <Button
            onClick={() => setNewCourseModalOpen(true)}
            className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs md:text-sm font-semibold gap-1.5 shadow-md shadow-brand-600/20"
          >
            <Plus className="w-4 h-4" />
            New Course
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Course Selection List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Enrolled Courses ({courses.length})
          </div>

          <div className="space-y-2.5">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              const completion = getCourseCompletion(course);

              return (
                <div
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    if (course.subjects && course.subjects.length > 0) {
                      setSelectedSubject(course.subjects[0]);
                    } else {
                      setSelectedSubject(null);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-brand-500/60 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/30"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {course.code || "CS"}
                        </Badge>
                        <span className="text-xs font-semibold text-brand-400">
                          {completion}% Done
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-white mt-1 truncate">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        {course.subjects?.length || 0} Subjects • {course.documents?.length || 0} Notes
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-500 mt-1 transition-transform ${
                        isSelected ? "text-brand-400 translate-x-0.5" : ""
                      }`}
                    />
                  </div>

                  <Progress value={completion} className="h-1 bg-slate-800 mt-3" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Selected Course Details */}
        {selectedCourse ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Course Header Banner */}
            <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/40 backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedCourse.code || "COURSE"}
                    </Badge>
                    <span className="text-xs text-emerald-400 font-medium">
                      {getCourseCompletion(selectedCourse)}% Completed
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {selectedCourse.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleOpenMockExam}
                    variant="outline"
                    className="border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs gap-1.5"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-rose-400" />
                    Mock Exam Paper
                  </Button>

                  <Button
                    size="sm"
                    onClick={openCheatSheet}
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Cheat Sheet
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => router.push(`/chat?courseId=${selectedCourse.id}`)}
                    className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs gap-1.5 shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask Course AI
                  </Button>
                </div>
              </div>

              {/* Subject Tabs */}
              {selectedCourse.subjects && selectedCourse.subjects.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80 no-scrollbar">
                  {selectedCourse.subjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                        selectedSubject?.id === sub.id
                          ? "bg-brand-500/20 text-brand-300 border border-brand-500/40"
                          : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {sub.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Uploaded Documents for this Course */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Course Documents & Notes (RAG)</h3>
                </div>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="text-xs text-brand-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload more
                </button>
              </div>

              {selectedCourse.documents && selectedCourse.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCourse.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <FileCode className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">
                            {doc.fileName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {formatBytes(doc.fileSize)} • Indexed for Q&A
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteDocument(doc.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => setUploadModalOpen(true)}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/30 text-center cursor-pointer transition-all"
                >
                  <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-300">
                    No lecture notes or syllabus PDFs uploaded yet
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click to upload PDFs to ground AI answers in your exact university lecture slides.
                  </p>
                </div>
              )}
            </div>

            {/* Chapters and Topics Syllabus Tree */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-semibold text-white">
                    {selectedSubject ? selectedSubject.title : "Course Syllabus Breakdown"}
                  </h3>
                </div>
              </div>

              {selectedSubject?.chapters && selectedSubject.chapters.length > 0 ? (
                <div className="space-y-3">
                  {selectedSubject.chapters.map((chapter, cIdx) => (
                    <Card
                      key={chapter.id || cIdx}
                      className="border-slate-800/80 bg-slate-950/60 overflow-hidden"
                    >
                      <CardHeader className="py-3 px-4 bg-slate-900/40 border-b border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xs font-semibold text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-brand-500/20 text-brand-300 flex items-center justify-center text-[10px] font-bold">
                              {cIdx + 1}
                            </span>
                            {chapter.title}
                          </CardTitle>
                          <span className="text-[11px] text-slate-500">
                            {chapter.topics?.length || 0} Topics
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-3 space-y-2">
                        {chapter.topics && chapter.topics.length > 0 ? (
                          chapter.topics.map((topic) => (
                            <div
                              key={topic.id}
                              onClick={() => openStudyStudio(topic)}
                              className="p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 hover:border-brand-500/40 flex items-center justify-between cursor-pointer transition-all group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  onClick={(e) => toggleTopicCompletion(topic.id, topic.completed, e)}
                                  className="text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                                  title={topic.completed ? "Mark incomplete" : "Mark completed"}
                                >
                                  {topic.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                                  )}
                                </button>
                                <span
                                  className={`text-xs font-medium truncate ${
                                    topic.completed
                                      ? "line-through text-slate-500"
                                      : "text-slate-200 group-hover:text-white"
                                  }`}
                                >
                                  {topic.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold">
                                  Study Studio <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 p-2 text-center">
                            No topics added in this chapter.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/40 text-center space-y-3">
                  <p className="text-xs text-slate-400">
                    No syllabus hierarchy in this subject yet.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSyllabusPrompt(selectedCourse.title);
                      setAiSyllabusModalOpen(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Auto-Generate Complete Units with AI
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col items-center justify-center p-12 text-center border border-slate-800 rounded-3xl bg-slate-950/40 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600" />
            <h3 className="text-base font-semibold text-white">Select a Course</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Choose an enrolled course from the sidebar to inspect its syllabus, upload lecture notes, or generate mock exams.
            </p>
          </div>
        )}
      </div>

      {/* AI Auto-Generate Syllabus Modal */}
      <Dialog open={aiSyllabusModalOpen} onOpenChange={setAiSyllabusModalOpen}>
        <DialogContent className="max-w-lg bg-slate-950 border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" /> AI Syllabus & Curriculum Builder
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Enter any course title or syllabus keywords. AI will automatically construct a complete semester-ready hierarchy with Units, Chapters, and High-Yield Topics.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Course Subject / Title *</label>
              <input
                type="text"
                value={syllabusPrompt}
                onChange={(e) => setSyllabusPrompt(e.target.value)}
                placeholder="e.g. Distributed Systems & Cloud Computing"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {generatedSyllabusPreview && (
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 space-y-1.5 animate-in zoom-in-95">
                <div className="font-semibold flex items-center gap-1.5 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Syllabus Created: {generatedSyllabusPreview.title} ({generatedSyllabusPreview.code})
                </div>
                <p className="text-[11px] text-slate-400">
                  {generatedSyllabusPreview.subjects?.length || 0} Units populated directly into your course database.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAiSyllabusModalOpen(false)}
              className="rounded-xl border-slate-800 text-slate-400 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateSyllabus}
              disabled={generatingSyllabus || !syllabusPrompt.trim()}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md"
            >
              {generatingSyllabus ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Constructing Syllabus...
                </>
              ) : (
                "Generate & Save Syllabus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Mock Exam Simulator Modal */}
      <Dialog open={mockExamModalOpen} onOpenChange={setMockExamModalOpen}>
        <DialogContent className="max-w-4xl bg-slate-950 border-white/[0.08] text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-rose-400" />
                  University Mock Examination Paper
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  Simulate official university semester examinations under timed conditions with model solutions.
                </DialogDescription>
              </div>

              {/* Exam Timer & Mode Controls */}
              {mockExamPaper && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
                      examSecondsLeft < 600
                        ? "bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse"
                        : "bg-slate-900 border-slate-800 text-slate-200"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>{formatTime(examSecondsLeft)}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowModelSolutions(!showModelSolutions)}
                    className={`rounded-xl text-xs gap-1.5 ${
                      showModelSolutions
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border-slate-800 text-slate-300"
                    }`}
                  >
                    {showModelSolutions ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showModelSolutions ? "Hide Marking Guide" : "Reveal Solutions"}
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {generatingMockExam ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
              <p className="text-sm text-slate-300 font-medium">
                Generating Authentic University Exam Paper...
              </p>
              <p className="text-xs text-slate-500">
                Synthesizing Section A (2-marks), Section B (5-marks), and Section C (10-marks)...
              </p>
            </div>
          ) : mockExamPaper ? (
            <div className="space-y-6 py-2">
              {/* Exam Paper Header Sheet */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/[0.08] text-center space-y-2 relative overflow-hidden">
                <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                  University Examination Board • Academic Semester
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {mockExamPaper.title}
                </h3>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-300 pt-1 font-mono">
                  <span>Course Code: <strong>{mockExamPaper.courseCode}</strong></span>
                  <span>•</span>
                  <span>Duration: <strong>{mockExamPaper.durationMinutes} Mins</strong></span>
                  <span>•</span>
                  <span>Max Marks: <strong>{mockExamPaper.totalMarks}</strong></span>
                </div>

                {/* Instructions */}
                {mockExamPaper.instructions && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-left">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      General Instructions:
                    </div>
                    <ul className="text-xs text-slate-400 space-y-0.5 list-disc list-inside">
                      {mockExamPaper.instructions.map((inst: string, i: number) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sections & Questions */}
              {mockExamPaper.sections?.map((sec: any, sIdx: number) => (
                <div key={sIdx} className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-brand-300 uppercase tracking-wider">
                        {sec.sectionName}
                      </h4>
                      <p className="text-[11px] text-slate-400">{sec.description}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {sec.markPerQuestion} Marks Each
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {sec.questions?.map((q: any) => (
                      <div
                        key={q.id || q.questionNumber}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                              Q{q.questionNumber}
                            </span>
                            <div>
                              <p className="text-xs md:text-sm font-semibold text-white leading-relaxed">
                                {q.question}
                              </p>
                              {q.topicsCovered && (
                                <span className="inline-block text-[10px] text-slate-500 font-mono mt-1">
                                  Topic: {q.topicsCovered}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                            [{sec.markPerQuestion}M]
                          </Badge>
                        </div>

                        {/* Student Scratchpad Answer Area */}
                        <div className="space-y-1">
                          <textarea
                            rows={3}
                            value={studentAnswers[q.id || q.questionNumber] || ""}
                            onChange={(e) =>
                              setStudentAnswers({
                                ...studentAnswers,
                                [q.id || q.questionNumber]: e.target.value,
                              })
                            }
                            placeholder="Type your exam answer here..."
                            className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none font-mono"
                          />
                        </div>

                        {/* Model Solution & Marking Rubric (Revealable) */}
                        {showModelSolutions && (
                          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 animate-in fade-in-50">
                            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Model Answer & Scoring Blueprint:
                            </div>
                            <div className="text-slate-300 leading-relaxed">
                              <MarkdownRenderer content={q.modelAnswer} />
                            </div>
                            {q.markingRubric && q.markingRubric.length > 0 && (
                              <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-slate-400">
                                <span className="font-semibold text-emerald-300">Marking Rubric:</span>
                                <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                                  {q.markingRubric.map((r: string, idx: number) => (
                                    <li key={idx}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Topic Study Studio Modal */}
      <Dialog open={studyStudioOpen} onOpenChange={setStudyStudioOpen}>
        <DialogContent className="max-w-4xl bg-slate-950 border-white/[0.08] text-white max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-brand-400" />
                  Topic Study Studio: {activeTopic?.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  Comprehensive conceptual breakdowns, 5-marker blueprints, and auto-saving personal notes.
                </DialogDescription>
              </div>

              {/* Study Studio Tabs */}
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveStudioTab("breakdown")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeStudioTab === "breakdown" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  AI Blueprint
                </button>
                <button
                  onClick={() => setActiveStudioTab("notes")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeStudioTab === "notes" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  My Notes
                </button>
              </div>
            </div>
          </DialogHeader>

          {loadingBreakdown ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
              <p className="text-xs text-slate-400">Loading topic studio breakdown...</p>
            </div>
          ) : activeStudioTab === "breakdown" && topicBreakdown ? (
            <div className="space-y-4 py-2">
              {/* Intuition & Analogy */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Intuition & Mental Model
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{topicBreakdown.intuition}</p>
                {topicBreakdown.realWorldAnalogy && (
                  <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-200">
                    <strong>Analogy:</strong> {topicBreakdown.realWorldAnalogy}
                  </div>
                )}
              </div>

              {/* 5-Marker University Format */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> 5-Mark University Answer Structure
                </h4>
                <div className="text-xs text-slate-300 leading-relaxed">
                  <MarkdownRenderer content={topicBreakdown.fiveMarkerAnswer} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Personal Topic Scratchpad (Markdown Supported)
                  </label>
                  <Button
                    size="sm"
                    onClick={saveTopicNote}
                    disabled={savingNote}
                    className="h-7 text-xs bg-brand-600 hover:bg-brand-500 text-white rounded-lg"
                  >
                    {savingNote ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                    Save Notes
                  </Button>
                </div>
                <textarea
                  rows={10}
                  value={topicNoteContent}
                  onChange={(e) => setTopicNoteContent(e.target.value)}
                  placeholder="Record your personal notes, formulas, professor tips, and exam insights here..."
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none font-mono"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cheat Sheet Modal */}
      <Dialog open={cheatSheetOpen} onOpenChange={setCheatSheetOpen}>
        <DialogContent className="max-w-3xl bg-slate-950 border-white/[0.08] text-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" /> Exam Revision Cheat Sheet
              </DialogTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={copyCheatSheet}
                className="rounded-xl border-slate-800 text-xs gap-1.5"
              >
                {copiedCheatSheet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCheatSheet ? "Copied!" : "Copy Markdown"}
              </Button>
            </div>
            <DialogDescription className="text-xs text-slate-400">
              High-yield printable course overview and universal 5-mark answer formulas.
            </DialogDescription>
          </DialogHeader>

          {loadingCheatSheet ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <p className="text-xs text-slate-400">Synthesizing course cheat sheet...</p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/[0.06] text-xs leading-relaxed space-y-2">
              <MarkdownRenderer content={cheatSheetContent} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Course Modal */}
      <Dialog open={newCourseModalOpen} onOpenChange={setNewCourseModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a university course or self-study subject to track notes and ask RAG questions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCourse} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Course Title *</label>
              <input
                type="text"
                required
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g. Distributed Systems & Cloud Architecture"
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Course Code</label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. CS-450"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Initial Subject</label>
                <input
                  type="text"
                  value={initialSubjectName}
                  onChange={(e) => setInitialSubjectName(e.target.value)}
                  placeholder="e.g. Consensus Algorithms"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={2}
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                placeholder="Brief summary of syllabus or exam objectives..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewCourseModalOpen(false)}
                className="rounded-xl border-slate-800 text-slate-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creatingCourse}
                className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white"
              >
                {creatingCourse ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Create Course
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Document Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Upload Study Notes & Material</DialogTitle>
            <DialogDescription>
              Upload PDF, DOCX, TXT, or Markdown for automatic text extraction, chunking, and semantic vector indexing.
            </DialogDescription>
          </DialogHeader>

          {uploadSuccess ? (
            <div className="py-8 text-center space-y-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-semibold text-white">Document Processed!</h3>
              <p className="text-xs text-slate-400">Chunks indexed and ready for AI Q&A.</p>
            </div>
          ) : (
            <form onSubmit={handleFileUpload} className="space-y-4 mt-2">
              <div className="border-2 border-dashed border-slate-800 hover:border-brand-500/60 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-slate-900/30">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-semibold text-brand-300">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">{formatBytes(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-slate-300">
                      Click to browse or drag & drop notes
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Supports PDF, DOCX, TXT, Markdown (Max 25MB)
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadModalOpen(false)}
                  className="rounded-xl border-slate-800 text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedFile || uploadingFile}
                  className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white"
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Parsing & Indexing...
                    </>
                  ) : (
                    "Upload & Process"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading courses...</p>
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
