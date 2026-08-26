"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Map,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Layers,
  Award,
  ChevronRight,
  Loader2,
  Code,
  FolderGit2,
  BookOpen,
  ArrowRight,
  Plus,
  Compass,
  Check,
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
} from "@/components/ui/dialog";
import { RoadmapItem, RoadmapNodeItem, RoadmapProjectItem, RoadmapNodeStatus } from "@/lib/types";
import { getDifficultyColor } from "@/lib/utils";

function RoadmapsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRoadmapId = searchParams.get("roadmapId");

  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapItem | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeItem | null>(null);
  const [nodeDetailModalOpen, setNodeDetailModalOpen] = useState(false);

  const [topicInput, setTopicInput] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Quick preset topic suggestions
  const SUGGESTED_TOPICS = [
    "Machine Learning & AI",
    "Modern React & Next.js",
    "Cybersecurity & Pentesting",
    "Data Structures & Algorithms",
    "Cloud Architecture & DevOps",
    "Computer Vision",
    "Full-Stack Python",
  ];

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  async function fetchRoadmaps() {
    try {
      setLoading(true);
      const res = await fetch("/api/roadmaps");
      const data = await res.json();
      const loaded: RoadmapItem[] = data.roadmaps || [];
      setRoadmaps(loaded);

      if (loaded.length > 0) {
        const found = initialRoadmapId
          ? loaded.find((r) => r.id === initialRoadmapId)
          : loaded[0];
        setSelectedRoadmap(found || loaded[0]);
      }
    } catch (err) {
      console.error("Error loading roadmaps:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleGenerateRoadmap = async (topicToGenerate?: string) => {
    const topic = topicToGenerate || topicInput;
    if (!topic.trim() || generating) return;

    try {
      setGenerating(true);
      const res = await fetch("/api/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          role: targetRole || undefined,
        }),
      });

      const data = await res.json();
      if (data.roadmap) {
        setRoadmaps([data.roadmap, ...roadmaps]);
        setSelectedRoadmap(data.roadmap);
        setTopicInput("");
        setTargetRole("");
      }
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
    } finally {
      setGenerating(false);
    }
  };

  const updateNodeStatus = async (nodeId: string, newStatus: RoadmapNodeStatus) => {
    if (!selectedRoadmap) return;

    try {
      // Optimistic update
      const updatedNodes = selectedRoadmap.nodes.map((n) =>
        n.id === nodeId ? { ...n, status: newStatus } : n
      );
      const updatedRoadmap = { ...selectedRoadmap, nodes: updatedNodes };

      setSelectedRoadmap(updatedRoadmap);
      if (selectedNode?.id === nodeId) {
        setSelectedNode({ ...selectedNode, status: newStatus });
      }

      setRoadmaps((prev) =>
        prev.map((r) => (r.id === selectedRoadmap.id ? updatedRoadmap : r))
      );

      await fetch(`/api/roadmaps/nodes/${nodeId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Error updating node status:", err);
    }
  };

  const calculateProgress = (roadmap: RoadmapItem) => {
    if (!roadmap.nodes || roadmap.nodes.length === 0) return 0;
    const completed = roadmap.nodes.filter((n) => n.status === "completed").length;
    return Math.round((completed / roadmap.nodes.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading interactive roadmaps...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Map className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Interactive Learning Roadmaps
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl">
          Enter any skill, technology, or computer science subject to generate a milestone-based, visual learning pathway with curated resources, practice tasks, and project blueprints.
        </p>

        {/* AI Generator Input Bar */}
        <div className="p-4 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Enter any skill or subject (e.g. 'Computer Vision', 'Cybersecurity', 'Cloud Computing')..."
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <Sparkles className="w-4 h-4 text-emerald-400 absolute left-4 top-4" />
            </div>

            <Button
              onClick={() => handleGenerateRoadmap()}
              disabled={!topicInput.trim() || generating}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs md:text-sm gap-2 shadow-lg shadow-emerald-600/20 shrink-0"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Roadmap
                </>
              )}
            </Button>
          </div>

          {/* Quick preset suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
            <span className="text-[11px] text-slate-500 font-medium shrink-0">
              Popular:
            </span>
            {SUGGESTED_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => handleGenerateRoadmap(topic)}
                disabled={generating}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/40 transition-all shrink-0 active:scale-95"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Roadmap Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Roadmap List Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            My Roadmaps ({roadmaps.length})
          </div>

          <div className="space-y-2.5">
            {roadmaps.map((r) => {
              const isSelected = selectedRoadmap?.id === r.id;
              const progress = calculateProgress(r);

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoadmap(r)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="emerald" className="text-[10px]">
                          {r.difficulty}
                        </Badge>
                        <span className="text-xs font-semibold text-emerald-400">
                          {progress}% Done
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-white mt-1 truncate">
                        {r.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        {r.targetRole || "Specialist"} • {r.estimatedHours}h
                      </p>
                    </div>
                  </div>

                  <Progress value={progress} className="h-1 bg-slate-800 mt-3" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Interactive Node Tree (8 cols) */}
        {selectedRoadmap ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Roadmap Header Summary */}
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald" className="font-mono text-xs">
                      {selectedRoadmap.category || "CAREER PATH"}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Est. Time: {selectedRoadmap.estimatedHours} Hours
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {selectedRoadmap.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-3 py-1 bg-slate-900">
                    {selectedRoadmap.nodes?.length || 0} Milestones
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 bg-slate-900">
                    {selectedRoadmap.projects?.length || 0} Projects
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Roadmap Progress</span>
                  <span className="font-semibold text-emerald-400">
                    {calculateProgress(selectedRoadmap)}%
                  </span>
                </div>
                <Progress
                  value={calculateProgress(selectedRoadmap)}
                  className="h-2 bg-slate-800"
                />
              </div>
            </div>

            {/* Interactive Visual Node Tree Flow */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Recommended Learning Sequence
                </h3>
                <span className="text-xs text-slate-400">
                  Click any node to explore details
                </span>
              </div>

              <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
                {selectedRoadmap.nodes.map((node, index) => {
                  const isCompleted = node.status === "completed";
                  const isInProgress = node.status === "in_progress";

                  return (
                    <div
                      key={node.id || index}
                      onClick={() => {
                        setSelectedNode(node);
                        setNodeDetailModalOpen(true);
                      }}
                      className={`relative pl-12 pr-4 py-4 rounded-2xl border transition-all cursor-pointer group ${
                        isCompleted
                          ? "bg-slate-950/60 border-slate-800/80 hover:border-emerald-500/40"
                          : isInProgress
                          ? "bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                          : "bg-slate-950/40 border-slate-850 hover:bg-slate-900/40 hover:border-slate-700"
                      }`}
                    >
                      {/* Node Bullet / Check Circle */}
                      <div
                        className={`absolute left-4 top-5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-emerald-500 text-slate-950 ring-4 ring-slate-950"
                            : isInProgress
                            ? "bg-amber-400 ring-4 ring-slate-950 animate-pulse"
                            : "bg-slate-700 ring-4 ring-slate-950"
                        }`}
                      >
                        {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Step {index + 1} • {node.stage}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${getDifficultyColor(node.difficulty)}`}
                            >
                              {node.difficulty}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                            {node.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {node.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {node.estimatedHours}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI-Generated Projects Blueprints */}
            {selectedRoadmap.projects && selectedRoadmap.projects.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-brand-400" />
                  <h3 className="text-base font-semibold text-white">
                    Hands-On Project Blueprints
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedRoadmap.projects.map((proj, idx) => (
                    <Card key={idx} className="border-slate-800 bg-slate-950/60 flex flex-col justify-between">
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="uppercase text-[10px]">
                            {proj.level} Project
                          </Badge>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {proj.estimatedTime}
                          </span>
                        </div>
                        <CardTitle className="text-sm font-semibold text-white mt-2">
                          {proj.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400 mt-1 line-clamp-3">
                          {proj.objective}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 pt-0 space-y-3">
                        {proj.skillsPracticed && proj.skillsPracticed.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {proj.skillsPracticed.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        {proj.architecture && (
                          <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-mono">
                            🏗️ {proj.architecture}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-8 py-16 text-center text-slate-500 space-y-2">
            <Map className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="text-sm">Select a roadmap or generate a new one to begin learning.</p>
          </div>
        )}
      </div>

      {/* Node Detail Drawer Modal */}
      <Dialog open={nodeDetailModalOpen} onOpenChange={setNodeDetailModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-white max-h-[85vh] overflow-y-auto">
          {selectedNode && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    Stage: {selectedNode.stage}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${getDifficultyColor(selectedNode.difficulty)}`}
                  >
                    {selectedNode.difficulty}
                  </Badge>
                  <span className="text-xs text-slate-400 ml-auto">
                    Est: {selectedNode.estimatedHours}
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold mt-1 text-white">
                  {selectedNode.title}
                </DialogTitle>
              </DialogHeader>

              {/* Status Selector Bar */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Milestone Status:
                </span>
                <div className="flex items-center gap-2">
                  {(["not_started", "in_progress", "completed"] as RoadmapNodeStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => updateNodeStatus(selectedNode.id, status)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                          selectedNode.status === status
                            ? status === "completed"
                              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                              : status === "in_progress"
                              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                              : "bg-slate-700 text-white"
                            : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                        }`}
                      >
                        {status.replace("_", " ")}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Explanation / Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Conceptual Overview
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                  {selectedNode.description}
                </p>
              </div>

              {/* Key Concepts */}
              {selectedNode.keyConcepts && selectedNode.keyConcepts.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Core Concepts to Master
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedNode.keyConcepts.map((concept, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                        <span>{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curated Resources */}
              {selectedNode.resources && selectedNode.resources.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Recommended Resources & Docs
                  </h4>
                  <div className="space-y-2">
                    {selectedNode.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-xs group transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-white group-hover:text-emerald-300 font-medium">
                            {res.title}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Tasks */}
              {selectedNode.practiceTasks && selectedNode.practiceTasks.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Practice Exercises
                  </h4>
                  <ul className="space-y-1.5 pl-2 text-xs text-slate-300 list-disc list-inside">
                    {selectedNode.practiceTasks.map((task, i) => (
                      <li key={i} className="leading-relaxed">
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setNodeDetailModalOpen(false);
                    router.push(`/chat?prompt=${encodeURIComponent(`Explain ${selectedNode.title} in depth with practical examples`)}`);
                  }}
                  className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask AI Tutor About This
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RoadmapsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading interactive roadmaps...</p>
        </div>
      }
    >
      <RoadmapsContent />
    </Suspense>
  );
}
