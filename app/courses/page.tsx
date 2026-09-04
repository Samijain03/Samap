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

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const deleteDocument = async (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      fetchCourses();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const toggleTopic = async (topicId: string) => {
    try {
      const res = await fetch(`/api/topics/${topicId}/toggle`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.topic) {
        // Update local state optimistically
        setCourses((prevCourses) =>
          prevCourses.map((c) => ({
            ...c,
            subjects: c.subjects.map((s) => ({
              ...s,
              chapters: s.chapters.map((ch) => ({
                ...ch,
                topics: ch.topics.map((t) =>
                  t.id === topicId ? { ...t, completed: data.topic.completed } : t
                ),
              })),
            })),
          }))
        );

        if (selectedCourse) {
          setSelectedCourse((prev) =>
            prev
              ? {
                  ...prev,
                  subjects: prev.subjects.map((s) => ({
                    ...s,
                    chapters: s.chapters.map((ch) => ({
                      ...ch,
                      topics: ch.topics.map((t) =>
                        t.id === topicId ? { ...t, completed: data.topic.completed } : t
                      ),
                    })),
                  })),
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error("Toggle topic failed:", err);
    }
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
            Organize subjects, upload lecture notes/PDFs, and ask questions with deep RAG context.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
            className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs md:text-sm font-medium gap-1.5 shadow-md shadow-brand-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Main Split Layout: Course Tabs / Sidebar + Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Course Selector (3 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Enrolled Courses ({courses.length})
          </div>

          <div className="space-y-2.5">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              const progress = getCourseCompletion(course);

              return (
                <div
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setSelectedSubject(course.subjects?.[0] || null);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-brand-500/60 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/30"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {course.code && (
                          <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                            {course.code}
                          </Badge>
                        )}
                        <span className="text-xs text-brand-400 font-semibold">
                          {progress}%
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-white truncate">
                        {course.title}
                      </h3>
                      {course.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{course.subjects?.length || 0} Subjects</span>
                    <span>{course.documents?.length || 0} Docs Indexed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Course & Subject Details (8 Cols) */}
        {selectedCourse ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Course Header Banner */}
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-4">
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

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => router.push(`/chat?courseId=${selectedCourse.id}`)}
                    className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs gap-1.5 shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask Course AI
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/quizzes?topic=${encodeURIComponent(selectedCourse.title)}`)}
                    className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 rounded-xl text-xs gap-1.5 text-slate-200"
                  >
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    Quiz Me
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
                  <h3 className="text-sm font-semibold text-white">Course Documents & Notes</h3>
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
                      className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-brand-400 shrink-0">
                          <FileCode className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-brand-300 transition-colors">
                            {doc.fileName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {doc.pageCount} Pages • {formatBytes(doc.fileSize)} • Ready for RAG
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="emerald" className="text-[10px] font-mono">
                          Indexed
                        </Badge>
                        <button
                          onClick={(e) => deleteDocument(doc.id, e)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete document from RAG index"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 space-y-2">
                  <FileUp className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No documents uploaded yet for this course. Upload syllabus or lecture notes to enable AI RAG!
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setUploadModalOpen(true)}
                    className="text-xs rounded-xl border-slate-700 bg-slate-900/60"
                  >
                    Upload Document
                  </Button>
                </div>
              )}
            </div>

            {/* Chapters & Topics Checklist */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Syllabus Breakdown: {selectedSubject?.title || "Chapters"}
                  </h3>
                </div>
              </div>

              {selectedSubject?.chapters && selectedSubject.chapters.length > 0 ? (
                <div className="space-y-3">
                  {selectedSubject.chapters.map((chapter) => (
                    <Card key={chapter.id} className="border-slate-800 bg-slate-950/60">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm text-slate-200 font-semibold flex items-center justify-between">
                          <span>{chapter.title}</span>
                          <span className="text-[11px] font-normal text-slate-400">
                            {chapter.topics.filter((t) => t.completed).length}/{chapter.topics.length} Done
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-1 space-y-2">
                        {chapter.topics.map((topic) => (
                          <div
                            key={topic.id}
                            onClick={() => toggleTopic(topic.id)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/40 hover:border-slate-700 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {topic.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0" />
                              )}
                              <span
                                className={`text-xs ${
                                  topic.completed
                                    ? "text-slate-400 line-through"
                                    : "text-slate-200 group-hover:text-white"
                                } truncate`}
                              >
                                {topic.title}
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/chat?prompt=${encodeURIComponent(`Explain ${topic.title} in detail`)}&courseId=${selectedCourse.id}`);
                              }}
                              className="text-[10px] text-brand-400 hover:text-brand-300 px-2 py-1 rounded bg-brand-500/10 border border-brand-500/20 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            >
                              Explain Topic
                            </button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No chapters defined yet for this subject.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 py-16 text-center text-slate-500 space-y-2">
            <BookOpen className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="text-sm">Select a course to view syllabus and study materials.</p>
          </div>
        )}
      </div>

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
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
