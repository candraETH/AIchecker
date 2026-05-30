export type ProviderId =
  | "openai"
  | "openrouter"
  | "groq"
  | "anthropic"
  | "gemini"
  | "deepseek"
  | "custom";

export interface ProviderDef {
  id: ProviderId;
  name: string;
  defaultUrl: string;
  authHeader: string; // template; {key} replaced
  docs: string;
  notes: string;
}

export const PROVIDERS: ProviderDef[] = [
  {
    id: "openai",
    name: "OpenAI",
    defaultUrl: "https://api.openai.com/v1/models",
    authHeader: "Bearer {key}",
    docs: "https://platform.openai.com/docs/api-reference",
    notes: "Standard OpenAI REST API.",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    defaultUrl: "https://openrouter.ai/api/v1/models",
    authHeader: "Bearer {key}",
    docs: "https://openrouter.ai/docs",
    notes: "Unified gateway across many model providers.",
  },
  {
    id: "groq",
    name: "Groq",
    defaultUrl: "https://api.groq.com/openai/v1/models",
    authHeader: "Bearer {key}",
    docs: "https://console.groq.com/docs",
    notes: "Fast inference, OpenAI-compatible.",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    defaultUrl: "https://api.anthropic.com/v1/models",
    authHeader: "x-api-key:{key}",
    docs: "https://docs.anthropic.com",
    notes: "Requires anthropic-version header (auto-added: 2023-06-01).",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    defaultUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    authHeader: "query:key={key}",
    docs: "https://ai.google.dev/gemini-api/docs",
    notes: "API key passed as query param.",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    defaultUrl: "https://api.deepseek.com/v1/models",
    authHeader: "Bearer {key}",
    docs: "https://api-docs.deepseek.com",
    notes: "OpenAI-compatible API.",
  },
  {
    id: "custom",
    name: "Custom Endpoint",
    defaultUrl: "",
    authHeader: "Bearer {key}",
    docs: "",
    notes: "Bring your own endpoint and headers.",
  },
];

export function getProvider(id: ProviderId): ProviderDef {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[PROVIDERS.length - 1];
}

export function detectProvider(url: string): ProviderId {
  const u = url.toLowerCase();
  if (u.includes("openai.com")) return "openai";
  if (u.includes("openrouter.ai")) return "openrouter";
  if (u.includes("groq.com")) return "groq";
  if (u.includes("anthropic.com")) return "anthropic";
  if (u.includes("googleapis.com") || u.includes("gemini")) return "gemini";
  if (u.includes("deepseek.com")) return "deepseek";
  return "custom";
}

export interface NormalizedModel {
  id: string;
  name: string;
  provider: string;
  status:
    | "active"
    | "inactive"
    | "listed"
    | "unknown"
    | "not_chat_or_inactive"
    | "no_access"
    | "rate_limited"
    | "error";
  contextWindow?: number;
  created?: string;
}

function normalizeModelStatus(
  model: Record<string, unknown>,
  fallback: NormalizedModel["status"],
): NormalizedModel["status"] {
  const boolStatus = model.active ?? model.enabled ?? model.available;
  if (typeof boolStatus === "boolean") return boolStatus ? "active" : "inactive";

  const raw = String(model.status ?? model.state ?? "").toLowerCase();
  if (["active", "available", "enabled", "ready", "live"].includes(raw)) return "active";
  if (["inactive", "disabled", "unavailable", "deprecated", "retired"].includes(raw)) return "inactive";
  if (["listed", "supported"].includes(raw)) return "listed";

  return fallback;
}

export function parseModels(body: unknown, providerId: ProviderId): NormalizedModel[] {
  const provider = getProvider(providerId).name;
  if (!body || typeof body !== "object") return [];
  const b = body as Record<string, unknown>;
  const fallbackStatus: NormalizedModel["status"] = providerId === "custom" ? "unknown" : "listed";

  // OpenAI/OpenRouter/Groq/DeepSeek: { data: [{ id, created, context_length? }] }
  if (Array.isArray(b.data)) {
    return (b.data as Array<Record<string, unknown>>).map((m) => ({
      id: String(m.id ?? m.name ?? ""),
      name: String(m.name ?? m.id ?? ""),
      provider: String(m.owned_by ?? provider),
      status: normalizeModelStatus(m, fallbackStatus),
      contextWindow:
        (typeof m.context_length === "number" && m.context_length) ||
        (typeof m.context_window === "number" && m.context_window) ||
        undefined,
      created:
        typeof m.created === "number"
          ? new Date(m.created * 1000).toISOString().slice(0, 10)
          : typeof m.created === "string"
            ? m.created.slice(0, 10)
            : undefined,
    }));
  }

  // Anthropic: { data: [...] } covered above. Some return { models: [...] }
  if (Array.isArray(b.models)) {
    return (b.models as Array<Record<string, unknown>>).map((m) => {
      const rawName = String(m.name ?? m.id ?? "");
      const id = rawName.replace(/^models\//, "");
      return {
        id,
        name: String(m.displayName ?? m.display_name ?? id),
        provider,
        status: normalizeModelStatus(m, fallbackStatus),
        contextWindow:
          typeof m.inputTokenLimit === "number" ? m.inputTokenLimit : undefined,
      };
    });
  }

  return [];
}
