import { useState, useMemo } from "react";
import { Copy, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { NormalizedModel } from "@/lib/providers";
import { useI18n } from "@/lib/i18n";

interface Props {
  models: NormalizedModel[];
  searchable?: boolean;
  pageSize?: number;
}

export function ModelsTable({ models, searchable = false, pageSize = 0 }: Props) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return models;
    return models.filter(
      (m) =>
        m.id.toLowerCase().includes(term) ||
        m.name.toLowerCase().includes(term) ||
        m.provider.toLowerCase().includes(term),
    );
  }, [models, q]);

  const paged = useMemo(() => {
    if (!pageSize) return filtered;
    return filtered.slice(page * pageSize, (page + 1) * pageSize);
  }, [filtered, page, pageSize]);

  const totalPages = pageSize ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;

  const statusStyles: Record<NormalizedModel["status"], string> = {
    active: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20",
    inactive: "bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20",
    listed: "bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20",
    unknown: "bg-muted text-muted-foreground border border-white/10 hover:bg-muted",
    not_chat_or_inactive: "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20",
    no_access: "bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20",
    rate_limited: "bg-violet-500/10 text-violet-300 border border-violet-500/30 hover:bg-violet-500/20",
    error: "bg-zinc-500/10 text-zinc-300 border border-zinc-500/30 hover:bg-zinc-500/20",
  };

  if (!models.length) {
    return (
      <div className="text-sm text-muted-foreground py-12 text-center">{t("models.empty")}</div>
    );
  }

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder={t("models.search")}
            className="pl-9 bg-background/40 border-white/10"
          />
        </div>
      )}
      <div className="rounded-xl border overflow-hidden bg-card/40">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>{t("models.col.id")}</TableHead>
              <TableHead>{t("models.col.name")}</TableHead>
              <TableHead>{t("models.col.provider")}</TableHead>
              <TableHead>{t("models.col.status")}</TableHead>
              <TableHead>{t("models.col.context")}</TableHead>
              <TableHead>{t("models.col.created")}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((m) => (
              <TableRow key={m.id} className="border-white/5">
                <TableCell className="font-mono text-xs">{m.id}</TableCell>
                <TableCell>{m.name}</TableCell>
                <TableCell className="text-muted-foreground">{m.provider}</TableCell>
                <TableCell>
                  <Badge className={statusStyles[m.status]}>{t(`models.${m.status}`)}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {m.contextWindow ? m.contextWindow.toLocaleString() : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{m.created ?? "—"}</TableCell>
                <TableCell>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(m.id);
                      toast.success("Copied");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="copy id"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 text-xs text-muted-foreground">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded border border-white/10 disabled:opacity-30"
          >
            ‹
          </button>
          <span>
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded border border-white/10 disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
