import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { getProvider } from "@/lib/providers";

export const Route = createFileRoute("/_app/history")({
  head: () => ({ meta: [{ title: "History — AI Endpoint Checker" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { t } = useI18n();
  const { history, clearHistory } = useAppStore();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return history;
    return history.filter(
      (h) => h.url.toLowerCase().includes(term) || h.provider.includes(term),
    );
  }, [history, q]);

  const exportCsv = () => {
    const head = "timestamp,provider,method,url,status,latency_ms,ok";
    const rows = filtered.map((h) =>
      [
        new Date(h.timestamp).toISOString(),
        h.provider,
        h.method,
        `"${h.url.replace(/"/g, '""')}"`,
        h.status,
        h.latencyMs,
        h.ok,
      ].join(","),
    );
    const blob = new Blob([head + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "endpoint-history.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("history.title")}</h1>
          <p className="text-muted-foreground mt-1">{history.length} entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={!history.length}>
            <Download className="size-4 mr-2" /> {t("history.export")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              clearHistory();
              toast.success(t("toast.deleted"));
            }}
            disabled={!history.length}
            className="text-rose-400 hover:text-rose-300"
          >
            <Trash2 className="size-4 mr-2" /> {t("history.clear")}
          </Button>
        </div>
      </div>

      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 md:p-6 space-y-3">
        <div className="relative max-w-sm">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("common.search")}
            className="pl-9 bg-background/40 border-white/10"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground py-12 text-center">
            {t("history.empty")}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden bg-card/40">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead>Time</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((h) => (
                  <TableRow key={h.id} className="border-white/5">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(h.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{getProvider(h.provider).name}</TableCell>
                    <TableCell className="font-mono text-xs">{h.method}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[420px] truncate">
                      {h.url}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          h.ok
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                        }
                      >
                        {h.status || "ERR"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{h.latencyMs}ms</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
