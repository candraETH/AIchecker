import { createFileRoute } from "@tanstack/react-router";
import { PROVIDERS } from "@/lib/providers";
import { useI18n } from "@/lib/i18n";
import { ExternalLink, Server } from "lucide-react";

export const Route = createFileRoute("/_app/providers")({
  head: () => ({ meta: [{ title: "Providers — AI Endpoint Checker" }] }),
  component: ProvidersPage,
});

function ProvidersPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("providers.title")}</h1>
        <p className="text-muted-foreground mt-1">Supported AI providers</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROVIDERS.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center text-primary">
                <Server className="size-5" />
              </div>
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{p.id}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-3">{p.notes}</div>
            {p.defaultUrl && (
              <div className="font-mono text-[11px] break-all bg-background/40 rounded p-2 border border-white/5 mb-3">
                {p.defaultUrl}
              </div>
            )}
            {p.docs && (
              <a
                href={p.docs}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 text-xs flex items-center gap-1 hover:underline"
              >
                Docs <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
