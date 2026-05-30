import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Github, Moon, Sun, Laptop, Check } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";
import { useI18n, type Lang } from "@/lib/i18n";
import abstractBackgroundUrl from "@/assets/abstract-shapes-background.jpg";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function ThemeToggle() {
  const { theme, setTheme, resolved } = useTheme();
  const Icon = resolved === "light" ? Sun : Moon;
  const items: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-card/60 border-white/10 size-9">
          <Icon className="size-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {items.map((it) => {
          const I = it.icon;
          return (
            <DropdownMenuItem key={it.value} onClick={() => setTheme(it.value)}>
              <I className="size-4 mr-2" />
              <span className="flex-1">{it.label}</span>
              {theme === it.value && <Check className="size-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FlagIcon({ lang }: { lang: Lang }) {
  if (lang === "id") {
    return (
      <svg aria-hidden="true" className="size-4 rounded-sm shadow-sm" viewBox="0 0 24 16">
        <rect width="24" height="8" fill="#ef4444" />
        <rect y="8" width="24" height="8" fill="#ffffff" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-4 rounded-sm shadow-sm" viewBox="0 0 24 16">
      <rect width="24" height="16" fill="#1d4ed8" />
      <path d="M0 0 24 16M24 0 0 16" stroke="#ffffff" strokeWidth="3" />
      <path d="M0 0 24 16M24 0 0 16" stroke="#ef4444" strokeWidth="1.4" />
      <path d="M12 0v16M0 8h24" stroke="#ffffff" strokeWidth="5" />
      <path d="M12 0v16M0 8h24" stroke="#ef4444" strokeWidth="2.8" />
    </svg>
  );
}

function LangToggle() {
  const { lang, setLang } = useI18n();
  const items: Array<{ value: Lang; label: string; short: string }> = [
    { value: "id", label: "Bahasa Indonesia", short: "ID" },
    { value: "en", label: "English", short: "EN" },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-card/60 border-white/10 h-9 gap-2">
          <FlagIcon lang={lang} />
          <span className="text-xs font-semibold">{lang.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {items.map((it) => (
          <DropdownMenuItem key={it.value} onClick={() => setLang(it.value)}>
            <span className="flex w-7 items-center">
              <FlagIcon lang={it.value} />
            </span>
            <span className="flex-1">{it.label}</span>
            {lang === it.value && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppLayout() {
  const [cursor, setCursor] = useState({ x: 1080, y: 260, active: false });
  const topWaveInfluence = cursor.active ? Math.max(0, 1 - Math.abs(cursor.y - 250) / 190) : 0;
  const lowerWaveInfluence = cursor.active ? Math.max(0, 1 - Math.abs(cursor.y - 610) / 230) : 0;
  const circuitInfluence = cursor.active
    ? Math.max(0, 1 - Math.hypot(cursor.x - 1110, cursor.y - 610) / 420)
    : 0;

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const width = window.innerWidth || event.currentTarget.clientWidth;
    const height = window.innerHeight || event.currentTarget.clientHeight;
    const x = Math.min(1440, Math.max(0, (event.clientX / width) * 1440));
    const y = Math.min(900, Math.max(0, (event.clientY / height) * 900));

    setCursor({ x, y, active: true });
  }

  return (
    <div
      className="relative isolate min-h-screen w-full overflow-hidden"
      onPointerCancel={() => setCursor((current) => ({ ...current, active: false }))}
      onPointerLeave={() => setCursor((current) => ({ ...current, active: false }))}
      onPointerMove={handlePointerMove}
    >
      <img
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover opacity-30 mix-blend-screen saturate-150 contrast-125"
        src={abstractBackgroundUrl}
        alt=""
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-background/45" />
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <defs>
          <linearGradient id="neon-line" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.08" />
            <stop offset="38%" stopColor="#38bdf8" stopOpacity="0.42" />
            <stop offset="72%" stopColor="#a78bfa" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="neon-accent" x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
            <stop offset="52%" stopColor="#60a5fa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.28" />
          </linearGradient>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="electric-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="thinGlow" />
            <feGaussianBlur stdDeviation="14" in="SourceGraphic" result="wideGlow" />
            <feMerge>
              <feMergeNode in="wideGlow" />
              <feMergeNode in="thinGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="reticle-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="halo" />
            <feMerge>
              <feMergeNode in="halo" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="neon-grid" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M 72 0 H 0 V 72" fill="none" stroke="#7dd3fc" strokeOpacity="0.09" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1440" height="900" fill="url(#neon-grid)" opacity="0.9" />
        <path
          className="transition-[opacity,stroke-width] duration-700 ease-out"
          d="M-90 705 C 160 575 330 680 540 575 S 925 245 1180 300 S 1480 315 1565 145"
          fill="none"
          filter="url(#electric-glow)"
          opacity={0.8 + lowerWaveInfluence * 0.2}
          stroke="url(#neon-line)"
          strokeLinecap="round"
          strokeWidth={3.6 + lowerWaveInfluence * 1.8}
        >
          <animate
            attributeName="d"
            calcMode="spline"
            dur="14s"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
            keyTimes="0; 0.5; 1"
            repeatCount="indefinite"
            values="
              M-90 705 C 160 575 330 680 540 575 S 925 245 1180 300 S 1480 315 1565 145;
              M-90 720 C 185 600 340 665 545 560 S 930 260 1180 290 S 1490 300 1565 155;
              M-90 705 C 160 575 330 680 540 575 S 925 245 1180 300 S 1480 315 1565 145
            "
          />
        </path>
        <path
          className="transition-[opacity,stroke-width] duration-700 ease-out"
          d="M-90 705 C 160 575 330 680 540 575 S 925 245 1180 300 S 1480 315 1565 145"
          fill="none"
          filter="url(#electric-glow)"
          opacity={0.38 + lowerWaveInfluence * 0.44}
          stroke="#67e8f9"
          strokeDasharray="42 560"
          strokeLinecap="round"
          strokeWidth={2 + lowerWaveInfluence * 1.8}
        >
          <animate attributeName="stroke-dashoffset" dur="6.4s" repeatCount="indefinite" values="0;-602" />
          <animate
            attributeName="d"
            calcMode="spline"
            dur="14s"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
            keyTimes="0; 0.5; 1"
            repeatCount="indefinite"
            values="
              M-90 705 C 160 575 330 680 540 575 S 925 245 1180 300 S 1480 315 1565 145;
              M-90 720 C 185 600 340 665 545 560 S 930 260 1180 290 S 1490 300 1565 155;
              M-90 705 C 160 575 330 680 540 575 S 925 245 1180 300 S 1480 315 1565 145
            "
          />
        </path>
        <path
          className="transition-[opacity,stroke-width] duration-700 ease-out"
          d="M-50 255 C 155 225 295 295 455 260 S 750 80 970 125 S 1250 315 1515 220"
          fill="none"
          filter="url(#electric-glow)"
          opacity={0.78 + topWaveInfluence * 0.22}
          stroke="url(#neon-accent)"
          strokeDasharray="16 18"
          strokeLinecap="round"
          strokeWidth={2.3 + topWaveInfluence * 1.7}
        >
          <animate
            attributeName="d"
            calcMode="spline"
            dur="12s"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
            keyTimes="0; 0.5; 1"
            repeatCount="indefinite"
            values="
              M-50 255 C 155 225 295 295 455 260 S 750 80 970 125 S 1250 315 1515 220;
              M-50 270 C 170 245 305 280 455 275 S 755 95 970 118 S 1260 300 1515 235;
              M-50 255 C 155 225 295 295 455 260 S 750 80 970 125 S 1250 315 1515 220
            "
          />
          <animate attributeName="stroke-dashoffset" dur="5.6s" repeatCount="indefinite" values="0;-68" />
        </path>
        <path
          className="transition-[opacity,stroke-width] duration-700 ease-out"
          d="M-50 255 C 155 225 295 295 455 260 S 750 80 970 125 S 1250 315 1515 220"
          fill="none"
          filter="url(#electric-glow)"
          opacity={0.26 + topWaveInfluence * 0.5}
          stroke="#f0abfc"
          strokeDasharray="34 440"
          strokeLinecap="round"
          strokeWidth={1.8 + topWaveInfluence * 1.5}
        >
          <animate attributeName="stroke-dashoffset" dur="5.2s" repeatCount="indefinite" values="0;-474" />
          <animate
            attributeName="d"
            calcMode="spline"
            dur="12s"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
            keyTimes="0; 0.5; 1"
            repeatCount="indefinite"
            values="
              M-50 255 C 155 225 295 295 455 260 S 750 80 970 125 S 1250 315 1515 220;
              M-50 270 C 170 245 305 280 455 275 S 755 95 970 118 S 1260 300 1515 235;
              M-50 255 C 155 225 295 295 455 260 S 750 80 970 125 S 1250 315 1515 220
            "
          />
        </path>
        <g
          fill="none"
          filter="url(#electric-glow)"
          stroke="url(#neon-line)"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-700 ease-out"
          transform={`translate(${circuitInfluence * 6} ${-circuitInfluence * 4})`}
        >
          <path d="M910 670 L1030 565 L1205 612 L1320 500" strokeOpacity={0.75 + circuitInfluence * 0.25} strokeWidth={2.4 + circuitInfluence * 2} />
          <path d="M100 510 L250 450 L360 492 L505 385" strokeOpacity={0.62 + lowerWaveInfluence * 0.2} strokeWidth={2.4 + lowerWaveInfluence * 1.1} />
          <path d="M1120 120 L1220 180 L1370 135" strokeOpacity={0.54 + topWaveInfluence * 0.2} strokeWidth={2.4 + topWaveInfluence * 1.1} />
          <animateTransform
            additive="sum"
            attributeName="transform"
            calcMode="spline"
            dur="10s"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
            keyTimes="0; 0.33; 0.66; 1"
            repeatCount="indefinite"
            type="translate"
            values="0 0; 4 -3; -3 2; 0 0"
          />
        </g>
        <g fill="none" filter="url(#soft-glow)" stroke="#5eead4" strokeOpacity={0.34 + circuitInfluence * 0.35}>
          <path d="M1020 715 h132 v54 h-132 z" strokeWidth="1.5" />
          <path d="M112 170 h180 v74 h-180 z" strokeWidth="1.5" />
          <path d="M1210 365 h118 v118 h-118 z" strokeWidth="1.5" />
        </g>
        <g filter="url(#electric-glow)" opacity="0.78">
          {[
            [210, 330, 3, 0],
            [430, 690, 2.4, 0.7],
            [720, 235, 2.6, 1.1],
            [1030, 455, 3.2, 1.6],
            [1275, 650, 2.8, 2.1],
          ].map(([cx, cy, radius, delay]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} fill="#67e8f9" opacity="0.58" r={radius}>
              <animate
                attributeName="cy"
                begin={`${delay}s`}
                calcMode="spline"
                dur="8s"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                keyTimes="0; 0.5; 1"
                repeatCount="indefinite"
                values={`${cy};${cy - 14};${cy}`}
              />
              <animate
                attributeName="opacity"
                begin={`${delay}s`}
                calcMode="spline"
                dur="8s"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                keyTimes="0; 0.5; 1"
                repeatCount="indefinite"
                values="0.22;0.62;0.22"
              />
            </circle>
          ))}
        </g>
        <g
          filter="url(#reticle-glow)"
          opacity={cursor.active ? 0.72 : 0.22}
          strokeLinecap="round"
          transform={`translate(${cursor.x} ${cursor.y})`}
        >
          <circle fill="none" r="54" stroke="#22d3ee" strokeDasharray="7 16" strokeOpacity="0.25" strokeWidth="1.2">
            <animate attributeName="r" dur="2.4s" repeatCount="indefinite" values="40;68;40" />
            <animate attributeName="stroke-opacity" dur="2.4s" repeatCount="indefinite" values="0.06;0.32;0.06" />
          </circle>
          <circle fill="#67e8f9" r="2.3" opacity="0.65" />
        </g>
      </svg>
      <div className="relative z-10 flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex items-center justify-end gap-2 px-4 md:px-8 py-3 border-b bg-background/60 backdrop-blur-lg">
            <LangToggle />
            <ThemeToggle />
            <Button variant="outline" size="sm" className="bg-card/60 border-white/10 h-9">
              <Github className="size-3.5 mr-2" />
              Star
              <span className="ml-2 px-1.5 py-0.5 rounded bg-muted text-xs">123</span>
            </Button>
          </header>
          <main className="flex-1 px-4 md:px-8 py-6 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
