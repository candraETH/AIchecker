import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Activity,
  Boxes,
  KeyRound,
  ScrollText,
  History as HistoryIcon,
  BarChart3,
  Server,
  BookOpen,
  Settings,
  Bot,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV: Array<{ to: string; key: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: "/", key: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { to: "/checker", key: "nav.checker", icon: Activity },
  { to: "/models", key: "nav.models", icon: Boxes },
  { to: "/keys", key: "nav.keys", icon: KeyRound },
  { to: "/logs", key: "nav.logs", icon: ScrollText },
  { to: "/history", key: "nav.history", icon: HistoryIcon },
  { to: "/analytics", key: "nav.analytics", icon: BarChart3 },
  { to: "/providers", key: "nav.providers", icon: Server },
  { to: "/docs", key: "nav.docs", icon: BookOpen },
  { to: "/settings", key: "nav.settings", icon: Settings },
];

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="size-9 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center text-primary">
          <Bot className="size-5" />
        </div>
        <span className="font-semibold text-base tracking-tight">AI Checker</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to as never}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r bg-primary shadow-[0_0_8px_var(--glow-blue)]" />
              )}
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t mx-3 my-3" />
      <div className="px-5 pb-5 text-xs">
        <div className="text-muted-foreground mb-1.5">{t("status.system")}</div>
        <div className="flex items-center gap-2 mb-1">
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400 pulse-dot" />
          <span className="font-medium text-emerald-300">{t("status.online")}</span>
        </div>
        <div className="text-muted-foreground text-[11px]">{t("status.normal")}</div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-64 shrink-0 border-r bg-sidebar/80 backdrop-blur-md">
        <SidebarBody />
      </aside>

      {/* Mobile */}
      <div className="md:hidden fixed top-3 left-3 z-40">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="bg-card/80 backdrop-blur-md">
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar">
            <SidebarBody onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
