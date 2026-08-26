"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup, demoLogin } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [learningStyle, setLearningStyle] = useState("balanced");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setErrorMsg("");
      const success = await signup(name, email, password, learningStyle);
      if (!success) {
        setErrorMsg("Failed to register. Please try another email or use Demo Login.");
      }
    } catch (err) {
      setErrorMsg("An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Glow Backdrop */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in-50 duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Samap</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create Your Free Account
          </h1>
          <p className="text-xs text-slate-400">
            Start structuring your courses, generating roadmaps, and mastering exams.
          </p>
        </div>

        {/* Signup Form */}
        <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-2xl">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs md:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@university.edu"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs md:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs md:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Learning Style Preference */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-300">Primary Goal</label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="balanced">Balanced (Conceptual + Examples)</option>
                <option value="exam-oriented">Exam-Oriented (University Marks)</option>
                <option value="practical">Practical (Coding Projects)</option>
                <option value="beginner">Beginner (ELI5 Intuition)</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs md:text-sm shadow-md shadow-brand-600/20 gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Registration"}
            </Button>
          </form>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
