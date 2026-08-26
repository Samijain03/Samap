"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Map,
  Sparkles,
  Award,
  BarChart3,
  Settings,
  Flame,
  GraduationCap,
  ChevronRight,
  LogOut,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Courses", href: "/courses", icon: BookOpen, badge: "RAG" },
  { name: "Roadmaps", href: "/roadmaps", icon: Map, badge: "AI" },
  { name: "AI Study Chat", href: "/chat", icon: Sparkles, highlight: true },
  { name: "Quiz Mode", href: "/quizzes", icon: Award },
  { name: "Study Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, demoLogin, isAuthenticated } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">
                Samap
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              by delusional club industries
            </p>
          </div>
        </Link>
      </div>

      {/* Streak & Level Bar */}
      <div className="mx-4 my-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-purple-500/10 border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">7 Day Streak!</div>
            <div className="text-[10px] text-slate-400">+250 XP earned today</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Learning Hub
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-white"
                      : item.highlight
                      ? "text-brand-400 group-hover:text-brand-300"
                      : "text-slate-400 group-hover:text-white"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card with Dropdown */}
      <div className="p-3 border-t border-slate-800/60 m-2 rounded-xl bg-slate-900/40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between group outline-none text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 p-[1px] shrink-0">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={user?.name || "Alex Rivera"}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="text-left truncate">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-brand-300">
                    {user?.name || "Alex Rivera"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user?.email || "alex@delusional.edu"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5 shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="end" className="w-56 bg-slate-950 border-slate-800 text-slate-200">
            <div className="p-2 border-b border-slate-800/80">
              <p className="text-xs font-semibold text-white">{user?.name || "Alex Rivera"}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || "alex@delusional.edu"}</p>
            </div>

            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 text-xs py-2">
                <Settings className="w-3.5 h-3.5" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-800/80" />

            <div className="px-2 py-1 text-[10px] text-slate-500 uppercase font-semibold">
              Switch Demo Profile
            </div>
            <DropdownMenuItem onClick={() => demoLogin("alex")} className="text-xs">
              <UserCheck className="w-3.5 h-3.5 mr-2 text-brand-400" />
              <span>Alex Rivera (CS Major)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => demoLogin("sarah")} className="text-xs">
              <UserCheck className="w-3.5 h-3.5 mr-2 text-emerald-400" />
              <span>Sarah Chen (AI Major)</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-800/80" />

            <DropdownMenuItem onClick={logout} className="text-xs text-rose-400 focus:text-rose-300">
              <LogOut className="w-3.5 h-3.5 mr-2" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
