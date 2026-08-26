"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setErrorMsg("");
      const success = await login(email, password);
      if (!success) {
        setErrorMsg("Invalid credentials. You can also use 1-Click Demo below!");
      }
    } catch (err) {
      setErrorMsg("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (account: "alex" | "sarah") => {
    setLoading(true);
    await demoLogin(account);
    setLoading(false);
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
            Welcome back to your Study Companion
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access your verified courses, roadmaps, and chat history.
          </p>
        </div>

        {/* 1-Click Demo Accounts Quick Sign-In */}
        <Card className="border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-400" /> Instant 1-Click Demo Access
            </span>
            <span className="text-[10px] text-slate-500">No password required</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo("alex")}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-brand-500/50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-brand-300">
                Alex Rivera
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">CS & OS Student</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemo("sarah")}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-emerald-300">
                Sarah Chen
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">AI / ML Researcher</div>
            </button>
          </div>
        </Card>

        {/* Credentials Form */}
        <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-2xl">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@delusional.edu"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs md:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs md:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs md:text-sm shadow-md shadow-brand-600/20 gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to Samap"}
            </Button>
          </form>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="text-brand-400 hover:underline font-semibold">
            Create Free Account
          </Link>
        </p>
      </div>
    </div>
  );
}
