"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Web Audio API synthesizer for clean sound notification without external asset dependencies
function playChime(type: "complete" | "tick") {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "complete") {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.7);
      });
    }
  } catch (e) {
    // Silently ignore if audio context blocked by browser autoplay policy
  }
}

export function PomodoroTimer() {
  const [mode, setMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [customFocusDuration, setCustomFocusDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(3);

  const MODE_TIMES = {
    focus: customFocusDuration * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    setTimeLeft(MODE_TIMES[mode]);
  }, [customFocusDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (soundEnabled) playChime("complete");

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
  }, [isRunning, timeLeft, mode, soundEnabled]);

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

  return (
    <div className="p-5 rounded-3xl border border-white/[0.08] bg-slate-950/70 backdrop-blur-xl shadow-xl space-y-4 relative overflow-hidden group">
      {/* Subtle pulse background when running */}
      {isRunning && (
        <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Focus & Flow Engine</h3>
            <p className="text-[11px] text-slate-400">Pomodoro Study Science</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode === "focus" && (
            <select
              value={customFocusDuration}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCustomFocusDuration(val);
                setIsRunning(false);
                setTimeLeft(val * 60);
              }}
              className="text-[11px] font-medium bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value={15}>15 min</option>
              <option value={25}>25 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? "Sound enabled (click to mute)" : "Sound muted (click to enable)"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Mode Switches */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/[0.06] text-xs relative z-10">
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
      <div className="relative flex flex-col items-center justify-center py-3 z-10">
        <div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-white select-none">
          {formatTime(timeLeft)}
        </div>
        <span className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
          <span>{sessionsCompleted} Deep Work Sessions Completed Today</span>
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center gap-3 relative z-10">
        <Button
          onClick={toggleTimer}
          className={`px-7 h-10 rounded-xl text-xs font-semibold gap-1.5 text-white shadow-lg transition-all active:scale-95 ${
            isRunning
              ? "bg-slate-800 hover:bg-slate-700 border border-slate-700"
              : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause Session
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
          className="rounded-xl border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white active:scale-95"
          title="Reset timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
