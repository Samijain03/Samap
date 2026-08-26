"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Flame,
  CheckCircle2,
  HelpCircle,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  BookOpen,
  Map,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await fetch("/api/analytics");
        const data = await res.json();
        setAnalytics(data.analytics);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your learning performance & analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Study Analytics & Insights
          </h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Track your course completion rate, study streak, quiz mastery radar, and weekly revision hours.
        </p>
      </div>

      {/* Top Stat KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <Card className="border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {analytics.streakDays} <span className="text-sm font-normal text-amber-400">Days 🔥</span>
          </div>
          <p className="text-[11px] text-slate-500">Top 5% consistency this semester</p>
        </Card>

        {/* Questions Asked */}
        <Card className="border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>AI Questions Asked</span>
            <Sparkles className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {analytics.questionsAsked}
          </div>
          <p className="text-[11px] text-slate-500">Deep conceptual inquiries</p>
        </Card>

        {/* Topics Completed */}
        <Card className="border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Topics Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {analytics.topicsCompleted}
            <span className="text-sm font-normal text-slate-400">/{analytics.totalTopics}</span>
          </div>
          <p className="text-[11px] text-slate-500">{analytics.courseProgressPct}% of active syllabus</p>
        </Card>

        {/* Avg Quiz Score */}
        <Card className="border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg Quiz Score</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {analytics.avgQuizScore}%
          </div>
          <p className="text-[11px] text-slate-500">Across {analytics.quizAttemptsCount} attempts</p>
        </Card>
      </div>

      {/* Main Charts Grid: Weekly Activity + Radar Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Study Activity Area Chart (7 Cols) */}
        <Card className="lg:col-span-7 border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-white">
                Weekly Study Time & Focus
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Hours spent studying and questions asked per day
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs text-brand-300">
              Total 23.8 hrs
            </Badge>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.weeklyStudyTrend}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  name="Study Hours"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subject Mastery Radar Chart (5 Cols) */}
        <Card className="lg:col-span-5 border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div>
            <CardTitle className="text-base font-semibold text-white">
              Subject Mastery Radar
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Competence distribution across your courses
            </CardDescription>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={analytics.subjectMastery}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                <Radar
                  name="Mastery %"
                  dataKey="mastery"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Progress Breakdown: Courses vs Roadmaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Syllabus Progress */}
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            <CardTitle className="text-base font-semibold text-white">
              University Course Progress
            </CardTitle>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span>Overall Syllabus Completion</span>
                <span className="font-semibold text-brand-400">
                  {analytics.courseProgressPct}%
                </span>
              </div>
              <Progress value={analytics.courseProgressPct} className="h-2 bg-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-400">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500">Completed Topics:</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {analytics.topicsCompleted}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500">Pending Topics:</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {Math.max(0, analytics.totalTopics - analytics.topicsCompleted)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Skill Roadmaps Mastery */}
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-base font-semibold text-white">
              Skill Roadmaps Mastery
            </CardTitle>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span>Milestones Completed</span>
                <span className="font-semibold text-emerald-400">
                  {analytics.roadmapProgressPct}%
                </span>
              </div>
              <Progress value={analytics.roadmapProgressPct} className="h-2 bg-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-400">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500">Completed Milestones:</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {analytics.roadmapsMastered}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500">Total Milestones:</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {analytics.totalRoadmapNodes}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
