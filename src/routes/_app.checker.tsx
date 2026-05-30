import { createFileRoute } from "@tanstack/react-router";
import { EndpointForm } from "@/components/endpoint-form";
import { JsonViewer } from "@/components/json-viewer";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/checker")({
  head: () => ({ meta: [{ title: "Endpoint Checker — AI Endpoint Checker" }] }),
  component: CheckerPage,
});

function CheckerPage() {
  const { t } = useI18n();
  const { lastResult } = useAppStore();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("nav.checker")}</h1>
        <p className="text-muted-foreground mt-1">{t("form.title")}</p>
      </div>
      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 md:p-6">
        <EndpointForm />
      </section>
      {lastResult && (
        <>
          <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Stat label="Status" value={`${lastResult.status}`} />
            <Stat label="Status Text" value={lastResult.statusText || "—"} />
            <Stat label="Latency" value={`${lastResult.latencyMs}ms`} />
            <Stat label="OK" value={lastResult.ok ? "true" : "false"} />
          </section>
          <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 md:p-6">
            <h2 className="text-lg font-semibold mb-4">{t("response.title")}</h2>
            <JsonViewer value={lastResult.body} maxHeight={640} />
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card/60 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold font-mono mt-1">{value}</div>
    </div>
  );
}
