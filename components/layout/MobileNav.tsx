"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Map,
  Sparkles,
  Calendar,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "AI Chat", href: "/chat", icon: Sparkles, isCenter: true },
  { name: "Exams", href: "/exam-planner", icon: Calendar },
  { name: "Quizzes", href: "/quizzes", icon: Award },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5 relative group"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95",
                    isActive
                      ? "bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-brand-500/40 text-white ring-4 ring-slate-950"
                      : "bg-gradient-to-tr from-slate-900 to-brand-900/60 border border-brand-500/40 text-brand-300 shadow-slate-950/50"
                  )}
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold mt-1",
                    isActive ? "text-brand-400" : "text-slate-400"
                  )}
                >
                  AI Chat
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors active:scale-95",
                isActive ? "text-brand-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-0.5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium tracking-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
