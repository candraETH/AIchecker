import { createFileRoute } from "@tanstack/react-router";
import { ModelsTable } from "@/components/models-table";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/models")({
  head: () => ({ meta: [{ title: "Models - AI Endpoint Checker" }] }),
  component: ModelsPage,
});

function ModelsPage() {
  const { t } = useI18n();
  const { models } = useAppStore();
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("nav.models")}</h1>
        <p className="text-muted-foreground mt-1">{models.length} {t("card.models.sub")}</p>
      </div>
      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 md:p-6">
        <ModelsTable models={models} searchable pageSize={20} />
      </section>
    </div>
  );
}
