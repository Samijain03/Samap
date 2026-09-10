"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  Map,
  Award,
  ArrowRight,
  Flame,
  Clock,
  CheckCircle2,
  Brain,
  Cpu,
  ChevronRight,
  Plus,
  Compass,
  FileText,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CourseItem, RoadmapItem, ActivityItem } from "@/lib/types";
import { StudyActionChips } from "@/components/chat/StudyActionChips";
import { PomodoroTimer } from "@/components/study/PomodoroTimer";
import { FlashcardsDeck } from "@/components/study/FlashcardsDeck";

import { useAuth } from "@/context/AuthContext";
import { LandingPage } from "@/components/landing/LandingPage";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [quickPrompt, setQuickPrompt] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | null>("explain");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, roadmapsRes, analyticsRes, examsRes] = await Promise.all([
          fetch("/api/courses"),
          fetch("/api/roadmaps"),
          fetch("/api/analytics"),
          fetch("/api/exams"),
        ]);
        const coursesData = await coursesRes.json();
        const roadmapsData = await roadmapsRes.json();
        const analyticsData = await analyticsRes.json();
        const examsData = await examsRes.json();

        setCourses(coursesData.courses || []);
        setRoadmaps(roadmapsData.roadmaps || []);
        setExams(examsData.exams || []);
        setActivities(analyticsData.analytics?.recentActivities || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated && !authLoading) {
    return <LandingPage />;
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center animate-pulse">
          <Sparkles className="w-5 h-5 text-brand-400" />
        </div>
        <p className="text-xs text-slate-400">Loading your workspace...</p>
      </div>
    );
  }

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    const query = encodeURIComponent(quickPrompt);
    const action = selectedAction ? `&action=${selectedAction}` : "";
    router.push(`/chat?prompt=${query}${action}`);
  };

  const getCourseProgress = (course: CourseItem) => {
    const allTopics = course.subjects?.flatMap((s) => s.chapters?.flatMap((c) => c.topics) || []) || [];
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter((t) => t.completed).length;
    return Math.round((completed / allTopics.length) * 100);
  };

  const getRoadmapProgress = (roadmap: RoadmapItem) => {
    if (!roadmap.nodes || roadmap.nodes.length === 0) return 0;
    const completed = roadmap.nodes.filter((n) => n.status === "completed").length;
    return Math.round((completed / roadmap.nodes.length) * 100);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
      {/* Hero Greeting & Quick AI Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-brand-950/40 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                  Personal AI University
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">Samap Engine v2.0</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300">{user?.name || "Scholar"}</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                What are we mastering today? Ask questions across your verified course notes or prepare with daily revision timetables.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                <Flame className="w-5 h-5 fill-amber-400 text-amber-500 animate-bounce" />
                <div className="text-left">
                  <div className="text-xs font-bold text-white">7 Day Streak</div>
                  <div className="text-[10px] text-amber-300/80">Keep it burning!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Exam Countdown Banner */}
          {exams.length > 0 && (
            <div
              onClick={() => router.push("/exam-planner")}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-brand-500/10 border border-rose-500/30 flex items-center justify-between cursor-pointer hover:border-rose-500/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-rose-300 transition-colors">
                    Upcoming Target: {exams[0].title}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Exam Date: {new Date(exams[0].examDate).toLocaleDateString()} • Target: {exams[0].targetScore || "Grade A"}
                  </div>
                </div>
              </div>
              <span className="text-xs text-rose-300 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Open Timetable <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {/* Quick AI Search Form */}
          <form onSubmit={handleQuickAsk} className="mt-4 space-y-3">
            <div className="relative flex items-center">
              <input
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="Ask anything about your courses (e.g. 'Explain binary search', 'What is convolution in CNNs?')..."
                className="w-full h-14 pl-12 pr-32 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm md:text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500/60 shadow-inner transition-all"
              />
              <Sparkles className="w-5 h-5 text-brand-400 absolute left-4 pointer-events-none" />
              <Button
                type="submit"
                className="absolute right-2 h-10 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs md:text-sm shadow-md"
              >
                Ask AI
              </Button>
            </div>

            {/* Quick Action Preset Chips */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500 font-medium shrink-0">
                Mode:
              </span>
              <StudyActionChips
                selectedAction={selectedAction}
                onSelectAction={setSelectedAction}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Main Grid: Continue Learning & Roadmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Continue Learning & Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-semibold text-white">Continue Learning</h2>
            </div>
            <Link
              href="/courses"
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium"
            >
              <span>View all courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Courses Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.slice(0, 2).map((course) => {
              const progress = getCourseProgress(course);
              const totalTopics = course.subjects?.flatMap((s) => s.chapters?.flatMap((c) => c.topics) || []).length || 0;
              const firstSubject = course.subjects?.[0];

              return (
                <Card
                  key={course.id}
                  className="group relative overflow-hidden border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 transition-all cursor-pointer"
                  onClick={() => router.push(`/courses?courseId=${course.id}`)}
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {course.code || "COURSE"}
                      </Badge>
                      <div className="text-xs font-semibold text-brand-400">
                        {progress}% Complete
                      </div>
                    </div>
                    <CardTitle className="text-base text-white group-hover:text-brand-300 transition-colors mt-2">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                    <Progress value={progress} className="h-1.5 bg-slate-800" />
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">
                          {firstSubject?.title || "Foundations"}
                        </span>
                      </div>
                      <span className="shrink-0">{totalTopics} topics</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {course.documents?.length || 1} RAG Notes
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-slate-300 hover:text-white"
                      >
                        Study Now <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Learning Roadmaps Section */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Interactive Roadmaps</h2>
              </div>
              <Link
                href="/roadmaps"
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <span>Explore all roadmaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {roadmaps.slice(0, 2).map((roadmap) => {
                const progress = getRoadmapProgress(roadmap);
                const activeNode = roadmap.nodes?.find((n) => n.status === "in_progress") || roadmap.nodes?.[0];

                return (
                  <div
                    key={roadmap.id}
                    onClick={() => router.push(`/roadmaps?roadmapId=${roadmap.id}`)}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-emerald-500/40 transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                            {roadmap.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Target: {roadmap.targetRole || "Specialist"} • {roadmap.estimatedHours} Hours
                          </p>
                        </div>
                      </div>
                      <Badge variant="emerald" className="text-xs font-semibold">
                        {progress}% Done
                      </Badge>
                    </div>

                    <Progress value={progress} className="h-1.5 bg-slate-800" />

                    {activeNode && (
                      <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-slate-400 truncate">Current Milestone:</span>
                          <span className="text-white font-medium truncate">{activeNode.title}</span>
                        </div>
                        <span className="text-slate-400 shrink-0 text-[11px] ml-2">
                          {activeNode.estimatedHours}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Study Science Tools */}
        <div className="space-y-6">
          {/* Pomodoro Focus Timer */}
          <PomodoroTimer />

          {/* Active Recall Flashcard Deck */}
          <FlashcardsDeck />

          {/* Quick Study Hub Card */}
          <Card className="border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-400" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2.5">
              <Button
                variant="outline"
                onClick={() => router.push("/chat?action=exam-answer")}
                className="w-full justify-start text-xs h-10 border-slate-800 bg-slate-900/40 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300"
              >
                <BookOpen className="w-3.5 h-3.5 mr-2 text-amber-400" />
                Generate 5-Mark Exam Answer
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/quizzes")}
                className="w-full justify-start text-xs h-10 border-slate-800 bg-slate-900/40 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-300"
              >
                <Award className="w-3.5 h-3.5 mr-2 text-purple-400" />
                Take Course Revision Quiz
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/roadmaps")}
                className="w-full justify-start text-xs h-10 border-slate-800 bg-slate-900/40 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300"
              >
                <Map className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                Generate New Learning Roadmap
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Recent Activity
                </span>
                <Link href="/analytics" className="text-xs text-brand-400 font-normal hover:underline">
                  Analytics
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              {activities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No recent activities recorded yet.
                </div>
              ) : (
                activities.slice(0, 5).map((act, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200 truncate">{act.title}</p>
                      {act.details && (
                        <p className="text-[11px] text-slate-400 truncate">{act.details}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
