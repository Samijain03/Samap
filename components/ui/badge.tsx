import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-500/20 text-brand-300 border-brand-500/30",
        brand:
          "border-transparent bg-brand-500/20 text-brand-300 border-brand-500/30",
        secondary:
          "border-transparent bg-slate-800 text-slate-300",
        destructive:
          "border-transparent bg-rose-500/20 text-rose-300 border-rose-500/30",
        outline: "text-slate-400 border-slate-700",
        emerald:
          "border-transparent bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        amber:
          "border-transparent bg-amber-500/20 text-amber-300 border-amber-500/30",
        purple:
          "border-transparent bg-purple-500/20 text-purple-300 border-purple-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
