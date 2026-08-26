"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Sun,
  Moon,
  Bell,
  Command,
  Flame,
  Menu,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCheck, Settings as SettingsIcon } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, demoLogin, isAuthenticated } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut Cmd+K or Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between">
        {/* Left: Mobile Brand & Search Trigger */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="flex md:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-md">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">Samap</span>
          </Link>

          {/* Search Bar Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-between w-full max-w-xs md:max-w-sm px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs md:text-sm text-slate-400 hover:text-slate-200 transition-all group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors shrink-0" />
              <span className="truncate">Search subjects, roadmaps, notes...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800/80 border border-slate-700/50 rounded-md">
              <Command className="w-3 h-3" /> K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick AI Study Assistant Button */}
          <Link href="/chat">
            <Button
              size="sm"
              className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-brand-600/20 text-xs font-semibold gap-1.5 flex items-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              <span className="hidden sm:inline">Ask AI Companion</span>
              <span className="sm:hidden">Ask AI</span>
            </Button>
          </Link>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={toggleTheme}
            className="rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </Button>

          {/* User Profile Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 p-[1px] hover:scale-105 transition-transform cursor-pointer">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={user?.name || "Alex Rivera"}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" align="end" className="w-56 bg-slate-950 border-slate-800 text-slate-200">
              <div className="p-2 border-b border-slate-800/80">
                <p className="text-xs font-semibold text-white">{user?.name || "Alex Rivera"}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || "alex@delusional.edu"}</p>
              </div>

              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 text-xs py-2">
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-800/80" />

              <div className="px-2 py-1 text-[10px] text-slate-500 uppercase font-semibold">
                Switch Demo Profile
              </div>
              <DropdownMenuItem onClick={() => demoLogin("alex")} className="text-xs">
                <UserCheck className="w-3.5 h-3.5 mr-2 text-brand-400" />
                <span>Alex Rivera (CS)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => demoLogin("sarah")} className="text-xs">
                <UserCheck className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                <span>Sarah Chen (AI)</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-800/80" />

              <DropdownMenuItem onClick={logout} className="text-xs text-rose-400 focus:text-rose-300">
                <LogOut className="w-3.5 h-3.5 mr-2" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
