import { createFileRoute } from "@tanstack/react-router";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { JsonViewer } from "@/components/json-viewer";

export const Route = createFileRoute("/_app/logs")({
  head: () => ({ meta: [{ title: "API Logs — AI Endpoint Checker" }] }),
  component: LogsPage,
});

function LogsPage() {
  const { t } = useI18n();
  const { lastResult } = useAppStore();
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("logs.title")}</h1>
        <p className="text-muted-foreground mt-1">Last request details</p>
      </div>
      {!lastResult ? (
        <div className="text-sm text-muted-foreground py-12 text-center rounded-2xl border bg-card/40">
          {t("logs.empty")}
        </div>
      ) : (
        <>
          <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 md:p-6">
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Response Headers</h2>
            <JsonViewer value={lastResult.headers} maxHeight={300} />
          </section>
          <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 md:p-6">
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Response Body</h2>
            <JsonViewer value={lastResult.body} maxHeight={500} />
          </section>
        </>
      )}
    </div>
  );
}
