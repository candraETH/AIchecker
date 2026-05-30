import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Play, Eye, EyeOff, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { checkEndpoint, deepCheckModels } from "@/lib/check.functions";
import { PROVIDERS, getProvider, detectProvider, parseModels, type ProviderId } from "@/lib/providers";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

interface Props {
  compact?: boolean;
}

function buildModelsUrl(rawUrl: string, provider: ProviderId): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.search = "";
    parsed.hash = "";

    let path = parsed.pathname.replace(/\/+$/, "");
    for (const suffix of ["/chat/completions", "/messages", "/models"]) {
      if (path.endsWith(suffix)) path = path.slice(0, -suffix.length);
    }

    if (provider === "anthropic" && !path.endsWith("/v1")) {
      path = `${path || ""}/v1`;
    }

    parsed.pathname = `${path || ""}/models`;
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function isDefaultProviderUrl(url: string): boolean {
  return PROVIDERS.some((provider) => provider.defaultUrl === url);
}

export function EndpointForm({ compact }: Props) {
  const { t } = useI18n();
  const { setResult, addHistory, lastUrl } = useAppStore();
  const checkFn = useServerFn(checkEndpoint);
  const deepCheckFn = useServerFn(deepCheckModels);

  const [url, setUrl] = useState(lastUrl || "https://api.openai.com/v1/models");
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [provider, setProvider] = useState<ProviderId>(detectProvider(url));
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [deepCheck, setDeepCheck] = useState(true);

  const mutation = useMutation({
    mutationFn: async () => {
      const requestUrl = deepCheck ? buildModelsUrl(url, provider) : url;
      const requestMethod = deepCheck ? "GET" : method;
      const res = await checkFn({
        data: { url: requestUrl, method: requestMethod, provider, apiKey, headers, body: deepCheck ? "" : body },
      });
      if (!deepCheck) {
        return {
          res,
          models: parseModels(res.body, provider).filter((model) => model.status === "active"),
          deepSummary: "",
        };
      }

      const deep = await deepCheckFn({
        data: { url, provider, apiKey, headers, timeoutMs: 15000, workers: 5 },
      });

      return {
        res,
        models: deep.models,
        deepSummary: `${deep.active}/${deep.checked} ${t("models.active").toLowerCase()}`,
      };
    },
    onSuccess: ({ res, models, deepSummary }) => {
      setResult(res, provider, url, models);
      addHistory({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        url,
        method,
        provider,
        status: res.status,
        latencyMs: res.latencyMs,
        ok: res.ok,
      });
      if (res.ok) toast.success(deepSummary ? `${res.status} • ${res.latencyMs}ms • ${deepSummary}` : `${res.status} • ${res.latencyMs}ms`);
      else toast.error(res.error ?? `${res.status} ${res.statusText}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Request failed");
    },
  });

  const onProviderChange = (p: ProviderId) => {
    const def = getProvider(p);
    setProvider(p);
    setMethod("GET");

    if (def.defaultUrl) {
      setUrl(def.defaultUrl);
    } else if (isDefaultProviderUrl(url)) {
      setUrl("");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-4"
    >
      <div className={compact ? "grid gap-4 md:grid-cols-12" : "grid gap-4 md:grid-cols-2"}>
        {compact && (
          <div className="md:col-span-3">
            <Label className="text-xs text-muted-foreground mb-2 block">{t("form.endpoint")}</Label>
            <Select value={provider} onValueChange={(v) => onProviderChange(v as ProviderId)}>
              <SelectTrigger className="bg-background/40 border-white/10 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {(!compact || provider === "custom") && (
        <div className={compact ? "md:col-span-4" : ""}>
          <Label className="text-xs text-muted-foreground mb-2 block">{t("form.url")}</Label>
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (!compact) setProvider(detectProvider(e.target.value));
            }}
            placeholder={provider === "custom" ? "https://api.provider.com/v1" : "https://api.openai.com/v1/models"}
            className="bg-background/40 border-white/10 h-11"
            required
          />
        </div>
        )}
        {!compact && (
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">{t("form.method")}</Label>
          <Select value={method} onValueChange={(v) => setMethod(v as "GET" | "POST")}>
            <SelectTrigger className="bg-background/40 border-white/10 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
            </SelectContent>
          </Select>
        </div>
        )}
        <div className={compact ? "md:col-span-3" : ""}>
          <Label className="text-xs text-muted-foreground mb-2 block">{t("form.apikey")}</Label>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="bg-background/40 border-white/10 h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="toggle"
            >
              {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className={compact ? "md:col-span-2 flex items-end" : "flex items-end"}>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="h-11 w-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_-4px_color-mix(in_oklab,var(--glow-blue)_60%,transparent)]"
          >
            <Play className="size-4 mr-2" />
            {mutation.isPending ? t("form.loading") : t("form.submit")}
          </Button>
        </div>
      </div>

      {!compact && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">{t("form.provider")}</Label>
            <Select value={provider} onValueChange={(v) => onProviderChange(v as ProviderId)}>
              <SelectTrigger className="bg-background/40 border-white/10 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end text-xs text-muted-foreground gap-2">
            <Info className="size-3.5 mt-0.5 text-sky-400" />
            {getProvider(provider).notes}
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-background/30 px-4 py-3">
            <div>
              <Label className="text-sm font-medium">{t("form.deepCheck")}</Label>
              <p className="mt-1 text-xs text-muted-foreground">{t("form.deepHint")}</p>
            </div>
            <Switch checked={deepCheck} onCheckedChange={setDeepCheck} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">{t("form.headers")}</Label>
            <Textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={4}
              placeholder={`{ "X-Title": "My App" }`}
              className="bg-background/40 border-white/10 font-mono text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">{t("form.body")}</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder={`{ "model": "gpt-4o" }`}
              className="bg-background/40 border-white/10 font-mono text-xs"
              disabled={method === "GET"}
            />
          </div>
        </div>
      )}

      {compact && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-background/30 px-3 py-2">
            <div>
              <Label className="text-xs font-medium">{t("form.deepCheck")}</Label>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{t("form.deepHint")}</p>
            </div>
            <Switch checked={deepCheck} onCheckedChange={setDeepCheck} />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="size-3.5 text-sky-400" />
            {t("form.example")}{" "}
            <button
              type="button"
              className="text-sky-400 hover:underline"
              onClick={() => setUrl("https://api.openai.com/v1/models")}
            >
              https://api.openai.com/v1/models
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
