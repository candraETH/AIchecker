import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/stat-card";
import { EndpointForm } from "@/components/endpoint-form";
import { ModelsTable } from "@/components/models-table";
import { JsonViewer } from "@/components/json-viewer";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { getProvider } from "@/lib/providers";
import { Activity, Boxes, Timer, Server } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Endpoint Checker" },
      { name: "description", content: "Real-time AI endpoint and model monitoring dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const { lastResult, lastProvider, models } = useAppStore();

  const statusValue = lastResult ? `${lastResult.status} ${lastResult.statusText || "OK"}` : "—";
  const statusOk = !!lastResult?.ok;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("app.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("app.subtitle")}</p>
      </div>

      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 md:p-6">
        <h2 className="text-lg font-semibold mb-4">{t("form.title")}</h2>
        <EndpointForm compact />
      </section>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("card.status")}
          color="blue"
          icon={<Activity className="size-4" />}
          value={
            <span className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${statusOk ? "bg-emerald-400" : lastResult ? "bg-rose-400" : "bg-muted-foreground/40"}`}
              />
              {statusValue}
            </span>
          }
          sub={t("card.status.sub")}
        />
        <StatCard
          label={t("card.models")}
          color="green"
          icon={<Boxes className="size-4" />}
          value={models.length}
          sub={t("card.models.sub")}
        />
        <StatCard
          label={t("card.response")}
          color="purple"
          icon={<Timer className="size-4" />}
          value={lastResult ? `${lastResult.latencyMs}ms` : "—"}
          sub={t("card.response.sub")}
        />
        <StatCard
          label={t("card.provider")}
          color="amber"
          icon={<Server className="size-4" />}
          value={lastProvider ? getProvider(lastProvider).name : "—"}
          sub={t("card.provider.sub")}
        />
      </section>

      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 md:p-6">
        <h2 className="text-lg font-semibold mb-4">{t("models.title")}</h2>
        <ModelsTable models={models.slice(0, 8)} />
      </section>

      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 md:p-6">
        <h2 className="text-lg font-semibold mb-4">{t("response.title")}</h2>
        {lastResult ? (
          <JsonViewer value={lastResult.body} />
        ) : (
          <div className="text-sm text-muted-foreground py-8 text-center">{t("response.empty")}</div>
        )}
      </section>
    </div>
  );
}
