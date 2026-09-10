"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Trash2,
  Loader2,
  BookOpen,
  Award,
  Flame,
  ArrowRight,
  Brain,
  ListTodo,
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
import { CourseItem } from "@/lib/types";

interface ExamItem {
  id: string;
  title: string;
  courseId?: string;
  examDate: string;
  targetScore?: string;
  syllabusSummary?: string;
  studyPlan?: {
    daysRemaining: number;
    targetScore: string;
    strategy: string;
    dailySchedules: {
      day: number;
      theme: string;
      tasks: { id: string; task: string; done: boolean }[];
    }[];
  };
  status: string;
}

function ExamPlannerContent() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [loading, setLoading] = useState(true);

  // New Exam Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [targetScore, setTargetScore] = useState("Grade A+ (95%+)");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [examsRes, coursesRes] = await Promise.all([
        fetch("/api/exams"),
        fetch("/api/courses"),
      ]);
      const examsData = await examsRes.json();
      const coursesData = await coursesRes.json();

      const loadedExams: ExamItem[] = examsData.exams || [];
      setExams(loadedExams);
      setCourses(coursesData.courses || []);

      if (loadedExams.length > 0) {
        setSelectedExam(loadedExams[0]);
      }
    } catch (err) {
      console.error("Error loading exam planner data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDate || creating) return;

    try {
      setCreating(true);
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: examTitle,
          courseId: selectedCourseId || undefined,
          examDate,
          targetScore,
        }),
      });

      const data = await res.json();
      if (data.exam) {
        setExams([data.exam, ...exams]);
        setSelectedExam(data.exam);
        setModalOpen(false);
        setExamTitle("");
        setExamDate("");
      }
    } catch (err) {
      console.error("Failed to create exam plan:", err);
    } finally {
      setCreating(false);
    }
  };

  const toggleTask = async (examId: string, taskId: string) => {
    if (!selectedExam) return;

    // Optimistic UI update
    const updatedDaily = selectedExam.studyPlan?.dailySchedules.map((day) => ({
      ...day,
      tasks: day.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    }));

    const updatedExam = {
      ...selectedExam,
      studyPlan: selectedExam.studyPlan
        ? { ...selectedExam.studyPlan, dailySchedules: updatedDaily || [] }
        : undefined,
    };

    setSelectedExam(updatedExam);
    setExams((prev) => prev.map((e) => (e.id === examId ? updatedExam : e)));

    try {
      await fetch(`/api/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const deleteExam = async (examId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/exams/${examId}`, { method: "DELETE" });
      const updated = exams.filter((e) => e.id !== examId);
      setExams(updated);
      if (selectedExam?.id === examId) {
        setSelectedExam(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error("Failed to delete exam:", err);
    }
  };

  const getDaysRemaining = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculatePlanProgress = (exam: ExamItem) => {
    const allTasks = exam.studyPlan?.dailySchedules.flatMap((d) => d.tasks) || [];
    if (allTasks.length === 0) return 0;
    const done = allTasks.filter((t) => t.done).length;
    return Math.round((done / allTasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your exam countdown & study timetable...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-400" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Exam Planner & Revision Timetable
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Set your target grades, calculate days remaining, and follow daily active recall schedules.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs md:text-sm font-semibold gap-1.5 shadow-lg shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" /> Plan Upcoming Exam
        </Button>
      </div>

      {exams.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-white/[0.08] bg-slate-900/40 space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Upcoming Exams Scheduled</h3>
            <p className="text-xs text-slate-400">
              Add your midterm or final exams to generate an intelligent day-by-day revision schedule with practice quizzes and 5-mark answer drills.
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold gap-1.5"
          >
            <Plus className="w-4 h-4" /> Plan Your First Exam
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Exam List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              Active Exam Targets ({exams.length})
            </div>

            <div className="space-y-2.5">
              {exams.map((exam) => {
                const isSelected = selectedExam?.id === exam.id;
                const daysLeft = getDaysRemaining(exam.examDate);
                const progress = calculatePlanProgress(exam);

                return (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExam(exam)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 border-brand-500/60 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/30"
                        : "bg-slate-950/60 border-white/[0.08] hover:bg-slate-900/50 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              daysLeft <= 3
                                ? "border-rose-500/50 text-rose-400 bg-rose-500/10"
                                : daysLeft <= 7
                                ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                                : "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                            }`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {daysLeft} Days Left
                          </Badge>
                          <span className="text-xs font-semibold text-brand-400">
                            {progress}% Done
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-white mt-1.5 truncate">
                          {exam.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          Target: {exam.targetScore || "Grade A"} • {new Date(exam.examDate).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={(e) => deleteExam(exam.id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Delete exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <Progress value={progress} className="h-1 bg-slate-800 mt-3" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Timetable & Day-by-Day Revision Tasks (8 cols) */}
          {selectedExam && (
            <div className="lg:col-span-8 space-y-6">
              {/* Exam Overview Banner */}
              <div className="p-6 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950/40 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="brand" className="font-mono text-xs">
                        TARGET: {selectedExam.targetScore || "GRADE A"}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        Exam Date: {new Date(selectedExam.examDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-1">
                      {selectedExam.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/chat?prompt=Give me a 5-mark exam study guide for ${encodeURIComponent(selectedExam.title)}&action=exam-answer`)}
                      className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs gap-1.5 shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Exam AI Guide
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/quizzes?topic=${encodeURIComponent(selectedExam.title)}`)}
                      className="border-slate-700 bg-slate-900/60 text-slate-200 rounded-xl text-xs gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                      Mock Quiz
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/[0.06] text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-brand-300">AI Strategy: </span>
                  {selectedExam.studyPlan?.strategy || "Daily structured active recall and exam question simulations."}
                </div>
              </div>

              {/* Day-by-Day Schedule Checklist */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-brand-400" />
                  <h3 className="text-base font-bold text-white">
                    Daily Active Recall Timetable
                  </h3>
                </div>

                <div className="space-y-4">
                  {selectedExam.studyPlan?.dailySchedules?.map((daySchedule, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-5 rounded-2xl border border-white/[0.08] bg-slate-950/60 backdrop-blur-md space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-brand-500/20 text-brand-300 text-xs font-mono font-semibold">
                            DAY {daySchedule.day}
                          </span>
                          <h4 className="font-semibold text-sm text-white">
                            {daySchedule.theme}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-500">
                          {daySchedule.tasks.filter((t) => t.done).length} / {daySchedule.tasks.length} Done
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {daySchedule.tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(selectedExam.id, task.id)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              task.done
                                ? "bg-slate-900/40 border-slate-800 text-slate-500 line-through"
                                : "bg-slate-900/90 border-white/[0.06] text-slate-200 hover:border-brand-500/40 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                  task.done
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "border-slate-600 bg-slate-950"
                                }`}
                              >
                                {task.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                              <span className="text-xs leading-relaxed">{task.task}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plan Exam Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle>Plan Upcoming Exam</DialogTitle>
            <DialogDescription>
              Enter your course exam details to generate a daily revision roadmap.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateExam} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Exam Title *</label>
              <input
                type="text"
                required
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g. Operating Systems Final Exam"
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Exam Date *</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Grade</label>
                <select
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Grade A+ (95%+)">Grade A+ (95%+)</option>
                  <option value="Grade A (90%+)">Grade A (90%+)</option>
                  <option value="Grade B (80%+)">Grade B (80%+)</option>
                  <option value="Passing Revision">Passing Revision</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Associated Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">General (No specific course)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    📚 {c.title}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border-slate-800 text-slate-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Generate Timetable
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ExamPlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading Exam Planner...</p>
        </div>
      }
    >
      <ExamPlannerContent />
    </Suspense>
  );
}
