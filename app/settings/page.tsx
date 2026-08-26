"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Sliders,
  Sparkles,
  Key,
  Moon,
  Sun,
  Check,
  Loader2,
  ShieldCheck,
  GraduationCap,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme/ThemeProvider";
import { LearningStyle, ExplanationTone, UserPreferences } from "@/lib/types";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  const [learningStyle, setLearningStyle] = useState<LearningStyle>("balanced");
  const [explanationTone, setExplanationTone] = useState<ExplanationTone>("friendly");
  const [alwaysExamples, setAlwaysExamples] = useState(true);
  const [preferredModel, setPreferredModel] = useState("gemini-1.5-flash");
  const [customApiKey, setCustomApiKey] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      try {
        setLoading(true);
        const res = await fetch("/api/preferences");
        const data = await res.json();
        if (data.preferences) {
          const p: UserPreferences = data.preferences;
          setLearningStyle(p.learningStyle || "balanced");
          setExplanationTone(p.explanationTone || "friendly");
          setAlwaysExamples(p.alwaysExamples !== false);
          setPreferredModel(p.preferredModel || "gemini-1.5-flash");
          setCustomApiKey(p.customApiKey || "");
        }
      } catch (err) {
        console.error("Error loading preferences:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learningStyle,
          explanationTone,
          alwaysExamples,
          preferredModel,
          customApiKey: customApiKey || null,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your profile & AI settings...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Study Preferences & Settings
          </h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Customize how Samap AI explains concepts, adjusts answers for exams, and formats responses.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile Card */}
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-brand-400" />
            <CardTitle className="text-base font-semibold text-white">User Profile</CardTitle>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 p-[2px] shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Alex Rivera"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-white">Alex Rivera</h3>
              <p className="text-xs text-slate-400">alex.rivera@delusional.edu</p>
              <Badge variant="emerald" className="text-[10px] uppercase font-mono">
                Samap Pro Learner
              </Badge>
            </div>
          </div>
        </Card>

        {/* AI Learning Style & Tone */}
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <div>
              <CardTitle className="text-base font-semibold text-white">
                AI Explanation Persona & Style
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Personalize how the AI approaches study questions
              </CardDescription>
            </div>
          </div>

          {/* Learning Style Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Primary Learning Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: "balanced", label: "Balanced & Intuitive", desc: "Clear analogies + technical rigor" },
                { id: "exam-oriented", label: "Exam-Oriented", desc: "5/10-mark definitions & tables" },
                { id: "practical", label: "Practical & Code-First", desc: "Step-by-step real code demos" },
                { id: "beginner", label: "Beginner (ELI5)", desc: "Intuitive metaphors & simple terms" },
                { id: "technical", label: "Rigorous Technical", desc: "Low-level system mechanics" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLearningStyle(item.id as LearningStyle)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    learningStyle === item.id
                      ? "bg-brand-500/10 border-brand-500 text-white ring-1 ring-brand-500/40"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{item.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-300">
              Explanation Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "friendly", label: "Friendly & Encouraging" },
                { id: "academic", label: "Academic / University" },
                { id: "concise", label: "Concise & Fast" },
                { id: "socratic", label: "Socratic / Guided" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setExplanationTone(item.id as ExplanationTone)}
                  className={`p-3 rounded-xl border text-center text-xs font-medium transition-all ${
                    explanationTone === item.id
                      ? "bg-purple-500/20 border-purple-500 text-purple-300 ring-1 ring-purple-500/40"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle: Always Explain with Examples */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <div className="text-xs font-semibold text-white">
                Always Include Practical Examples
              </div>
              <p className="text-[11px] text-slate-400">
                AI will automatically append code snippets or real-world cases to all answers.
              </p>
            </div>
            <Switch
              checked={alwaysExamples}
              onCheckedChange={setAlwaysExamples}
            />
          </div>
        </Card>

        {/* AI Provider & Models */}
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-400" />
            <div>
              <CardTitle className="text-base font-semibold text-white">
                AI Provider & API Keys
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Configure preferred AI engine (Works zero-config with built-in Demo mode!)
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Preferred AI Model</label>
              <select
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra Fast)</option>
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Reasoning)</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                <option value="llama-3.3-70b">Groq Llama 3.3 70B</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Custom API Key (Optional)
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy... or sk-..."
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              Zero API key required: Samap automatically uses its internal generative study brain when no custom key is provided.
            </span>
          </div>
        </Card>

        {/* Theme Settings */}
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-brand-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <CardTitle className="text-base font-semibold text-white">
                  Appearance Theme
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Switch between Dark Mode (Default) and Light Mode
                </CardDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={toggleTheme}
              className="rounded-xl border-slate-700 bg-slate-900/60 text-xs"
            >
              {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
            </Button>
          </div>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences saved!
            </span>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs md:text-sm px-6 h-11 shadow-lg shadow-brand-600/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
