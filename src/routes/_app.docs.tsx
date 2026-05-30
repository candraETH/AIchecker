import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/docs")({
  head: () => ({ meta: [{ title: "Documentation — AI Endpoint Checker" }] }),
  component: DocsPage,
});

function DocsPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("docs.title")}</h1>
      </div>
      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-6 space-y-4 text-sm leading-relaxed">
        <div>
          <h2 className="text-base font-semibold mb-2">Getting Started</h2>
          <p className="text-muted-foreground">
            Pick a provider on the Endpoint Checker page, paste your API key (optional for public
            endpoints), and click Check Endpoint. Results include status code, latency, parsed
            models, and the raw JSON response.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold mb-2">Supported Providers</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>OpenAI · Bearer token authentication</li>
            <li>OpenRouter · Bearer token authentication</li>
            <li>Groq · OpenAI-compatible Bearer token</li>
            <li>Anthropic · x-api-key header + anthropic-version</li>
            <li>Google Gemini · API key via query parameter</li>
            <li>DeepSeek · OpenAI-compatible Bearer token</li>
            <li>Custom · Any endpoint with custom headers</li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold mb-2">Privacy</h2>
          <p className="text-muted-foreground">
            API keys, history, and settings live only in your browser's localStorage. Requests are
            proxied through this app's server to bypass CORS but are not logged.
          </p>
        </div>
      </section>
    </div>
  );
}
