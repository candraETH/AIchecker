import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlowColor = "blue" | "green" | "purple" | "amber";

interface Props {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  color?: GlowColor;
  icon?: ReactNode;
}

const COLOR_MAP: Record<GlowColor, { text: string; bg: string; ring: string }> = {
  blue: {
    text: "text-sky-300",
    bg: "from-sky-500/10 via-transparent to-transparent",
    ring: "before:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--glow-blue)_70%,transparent),transparent_60%)]",
  },
  green: {
    text: "text-emerald-300",
    bg: "from-emerald-500/10 via-transparent to-transparent",
    ring: "before:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--glow-green)_70%,transparent),transparent_60%)]",
  },
  purple: {
    text: "text-violet-300",
    bg: "from-violet-500/10 via-transparent to-transparent",
    ring: "before:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--glow-purple)_70%,transparent),transparent_60%)]",
  },
  amber: {
    text: "text-amber-300",
    bg: "from-amber-500/10 via-transparent to-transparent",
    ring: "before:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--glow-amber)_70%,transparent),transparent_60%)]",
  },
};

export function StatCard({ label, value, sub, color = "blue", icon }: Props) {
  const c = COLOR_MAP[color];
  return (
    <div
      className={cn(
        "grad-border relative rounded-2xl p-5 bg-card/60 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-xl overflow-hidden",
        c.ring,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", c.bg)} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className={cn("text-sm font-medium", c.text)}>{label}</span>
          {icon ? <span className={cn("opacity-80", c.text)}>{icon}</span> : null}
        </div>
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
        {sub ? <div className="text-xs text-muted-foreground mt-2">{sub}</div> : null}
      </div>
    </div>
  );
}
