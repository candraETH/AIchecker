import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { StatCard } from "@/components/stat-card";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { getProvider } from "@/lib/providers";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — AI Endpoint Checker" }] }),
  component: AnalyticsPage,
});

const COLORS = ["#38bdf8", "#34d399", "#a78bfa", "#fbbf24", "#f472b6", "#60a5fa", "#f87171"];

function AnalyticsPage() {
  const { t } = useI18n();
  const { history } = useAppStore();

  const stats = useMemo(() => {
    const total = history.length;
    const ok = history.filter((h) => h.ok).length;
    const avg = total ? Math.round(history.reduce((s, h) => s + h.latencyMs, 0) / total) : 0;
    const byProvider = Object.entries(
      history.reduce<Record<string, number>>((acc, h) => {
        acc[h.provider] = (acc[h.provider] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([k, v]) => ({ name: getProvider(k as never).name, value: v }));
    const latency = history
      .slice(0, 30)
      .reverse()
      .map((h, i) => ({ i: i + 1, ms: h.latencyMs }));
    return { total, ok, avg, byProvider, latency, successRate: total ? Math.round((ok / total) * 100) : 0 };
  }, [history]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("analytics.title")}</h1>
      </div>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard label={t("analytics.requests")} color="blue" value={stats.total} />
        <StatCard label={t("analytics.avgLatency")} color="purple" value={`${stats.avg}ms`} />
        <StatCard label={t("analytics.successRate")} color="green" value={`${stats.successRate}%`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card/40 backdrop-blur-md p-5">
          <h2 className="text-sm font-semibold mb-4">{t("analytics.latencyTrend")}</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={stats.latency}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="i" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,24,38,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                  }}
                />
                <Line type="monotone" dataKey="ms" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card/40 backdrop-blur-md p-5">
          <h2 className="text-sm font-semibold mb-4">{t("analytics.byProvider")}</h2>
          <div className="h-64">
            {stats.byProvider.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">
                No data
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stats.byProvider} dataKey="value" nameKey="name" outerRadius={90}>
                    {stats.byProvider.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(20,24,38,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4">Requests per Provider</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={stats.byProvider}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,24,38,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" fill="#a78bfa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
