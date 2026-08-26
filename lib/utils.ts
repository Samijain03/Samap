import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
    case "easy":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "intermediate":
    case "medium":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "advanced":
    case "hard":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    case "expert":
    case "exam":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}
