"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  Coffee,
  Brain,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function PomodoroTimer() {
  const [mode, setMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(3);

  const MODE_TIMES = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === "focus") {
        setSessionsCompleted((prev) => prev + 1);
        setMode("shortBreak");
        setTimeLeft(MODE_TIMES.shortBreak);
      } else {
        setMode("focus");
        setTimeLeft(MODE_TIMES.focus);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const switchMode = (newMode: "focus" | "shortBreak" | "longBreak") => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPct = ((MODE_TIMES[mode] - timeLeft) / MODE_TIMES[mode]) * 100;

  return (
    <div className="p-5 rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Focus & Flow Timer</h3>
            <p className="text-[11px] text-slate-400">Pomodoro Study Engine</p>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title={soundEnabled ? "Mute soundscapes" : "Enable study binaural audio"}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-brand-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Mode Switches */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs">
        <button
          onClick={() => switchMode("focus")}
          className={`py-1.5 rounded-lg font-medium transition-all ${
            mode === "focus"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Deep Focus
        </button>
        <button
          onClick={() => switchMode("shortBreak")}
          className={`py-1.5 rounded-lg font-medium transition-all ${
            mode === "shortBreak"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Short Rest
        </button>
        <button
          onClick={() => switchMode("longBreak")}
          className={`py-1.5 rounded-lg font-medium transition-all ${
            mode === "longBreak"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Long Rest
        </button>
      </div>

      {/* Timer Display */}
      <div className="relative flex flex-col items-center justify-center py-4">
        <div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-white">
          {formatTime(timeLeft)}
        </div>
        <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          {sessionsCompleted} Deep Work Sessions Done Today
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={toggleTimer}
          className={`px-6 h-10 rounded-xl text-xs font-semibold gap-1.5 text-white shadow-lg transition-all ${
            isRunning
              ? "bg-slate-800 hover:bg-slate-700 border border-slate-700"
              : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> Start Focus
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="iconSm"
          onClick={resetTimer}
          className="rounded-xl border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
          title="Reset timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
