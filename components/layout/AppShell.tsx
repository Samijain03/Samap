"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isLandingPage = pathname === "/" && !isAuthenticated && !isLoading;

  // On Landing page or Login/Signup, render full-width clean canvas without app sidebar/header
  if (isAuthPage || isLandingPage) {
    return <div className="min-h-screen w-full bg-[#080c14] text-slate-100">{children}</div>;
  }

  // On App pages, render full SaaS shell with Sidebar, Header, and Mobile bottom navigation
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080c14] text-slate-100 antialiased overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0 pb-16 md:pb-0">
        <Header />
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
