import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseModels, PROVIDERS, type NormalizedModel, type ProviderId } from "./providers";

const CheckInput = z.object({
  url: z.string().url().max(2000),
  method: z.enum(["GET", "POST"]).default("GET"),
  provider: z.enum(["openai", "openrouter", "groq", "anthropic", "gemini", "deepseek", "custom"]),
  apiKey: z.string().max(8192).optional().default(""),
  headers: z.string().max(8192).optional().default(""),
  body: z.string().max(65536).optional().default(""),
});

const DeepCheckInput = z.object({
  url: z.string().url().max(2000),
  provider: z.enum(["openai", "openrouter", "groq", "anthropic", "gemini", "deepseek", "custom"]),
  apiKey: z.string().max(8192).optional().default(""),
  headers: z.string().max(8192).optional().default(""),
  timeoutMs: z.number().int().min(1000).max(60000).optional().default(15000),
  workers: z.number().int().min(1).max(10).optional().default(5),
});

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface CheckResult {
  ok: boolean;
  status: number;
  statusText: string;
  latencyMs: number;
  headers: Record<string, string>;
  body: JsonValue;
  rawBody: string;
  error?: string;
  finalUrl: string;
}

export interface DeepCheckResult {
  models: NormalizedModel[];
  checked: number;
  active: number;
  listed: number;
}

function applyCustomHeaders(headers: Headers, rawHeaders: string): void {
  if (!rawHeaders.trim()) return;

  try {
    const parsed = JSON.parse(rawHeaders);
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string") headers.set(k, v);
    }
  } catch {
    /* ignore invalid headers */
  }
}

function applyAuth(
  url: string,
  headers: Headers,
  providerId: ProviderId,
  apiKey: string,
): string {
  if (!apiKey) return url;
  const prov = PROVIDERS.find((p) => p.id === providerId);
  if (!prov) return url;
  const tmpl = prov.authHeader;
  if (tmpl.startsWith("Bearer ")) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  } else if (tmpl.startsWith("x-api-key:")) {
    headers.set("x-api-key", apiKey);
    if (providerId === "anthropic") headers.set("anthropic-version", "2023-06-01");
  } else if (tmpl.startsWith("query:")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}key=${encodeURIComponent(apiKey)}`;
  }
  return url;
}

function normalizeBaseUrl(url: string): string {
  const parsed = new URL(url);
  parsed.search = "";
  parsed.hash = "";

  let path = parsed.pathname.replace(/\/+$/, "");
  for (const suffix of ["/chat/completions", "/messages", "/models"]) {
    if (path.endsWith(suffix)) path = path.slice(0, -suffix.length);
  }

  parsed.pathname = path || "/";
  return parsed.toString().replace(/\/+$/, "");
}

function buildEndpoint(baseUrl: string, path: string, provider: ProviderId): string {
  const base = normalizeBaseUrl(baseUrl);
  if (provider === "anthropic" && !base.endsWith("/v1")) {
    return `${base}/v1/${path.replace(/^\/+/, "")}`;
  }
  return `${base}/${path.replace(/^\/+/, "")}`;
}

async function fetchJson(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ status: number; ok: boolean; body: JsonValue; rawBody: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const rawBody = await res.text();
    let body: JsonValue = rawBody;
    try {
      body = JSON.parse(rawBody) as JsonValue;
    } catch {
      /* keep raw */
    }
    return { status: res.status, ok: res.ok, body, rawBody };
  } finally {
    clearTimeout(timeout);
  }
}

function extractError(body: JsonValue): string {
  if (!body || typeof body !== "object" || Array.isArray(body)) return String(body ?? "");
  const payload = body as Record<string, unknown>;
  const error = payload.error ?? payload;
  if (error && typeof error === "object" && !Array.isArray(error)) {
    const err = error as Record<string, unknown>;
    return String(err.message ?? err.code ?? err.type ?? JSON.stringify(err));
  }
  return String(error ?? "");
}

async function probeModel(
  model: NormalizedModel,
  baseUrl: string,
  provider: ProviderId,
  apiKey: string,
  rawHeaders: string,
  timeoutMs: number,
): Promise<NormalizedModel> {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  applyCustomHeaders(headers, rawHeaders);

  const url =
    provider === "anthropic"
      ? buildEndpoint(baseUrl, "/messages", provider)
      : buildEndpoint(baseUrl, "/chat/completions", provider);
  const finalUrl = applyAuth(url, headers, provider, apiKey);
  headers.set("Content-Type", "application/json");

  const body =
    provider === "anthropic"
      ? {
          model: model.id,
          messages: [{ role: "user", content: "Reply with OK only." }],
          temperature: 0,
          max_tokens: 2,
        }
      : {
          model: model.id,
          messages: [{ role: "user", content: "Reply with OK only." }],
          temperature: 0,
          max_tokens: 2,
        };

  try {
    const response = await fetchJson(
      finalUrl,
      { method: "POST", headers, body: JSON.stringify(body) },
      timeoutMs,
    );

    if (response.ok) return { ...model, status: "active" };
    if ([400, 404, 422].includes(response.status)) return { ...model, status: "not_chat_or_inactive" };
    if ([401, 403].includes(response.status)) return { ...model, status: "no_access" };
    if (response.status === 429) return { ...model, status: "rate_limited" };

    return {
      ...model,
      status: extractError(response.body).toLowerCase().includes("inactive") ? "inactive" : "error",
    };
  } catch {
    return { ...model, status: "error" };
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  workers: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;

  async function runWorker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(workers, items.length) }, runWorker));
  return results;
}

export const checkEndpoint = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CheckInput.parse(data))
  .handler(async ({ data }): Promise<CheckResult> => {
    const headers = new Headers();
    headers.set("Accept", "application/json");

    applyCustomHeaders(headers, data.headers);

    const finalUrl = applyAuth(data.url, headers, data.provider as ProviderId, data.apiKey);

    const init: RequestInit = { method: data.method, headers };
    if (data.method === "POST" && data.body.trim()) {
      init.body = data.body;
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    init.signal = controller.signal;

    const t0 = performance.now();
    try {
      const res = await fetch(finalUrl, init);
      const latencyMs = Math.round(performance.now() - t0);
      const rawBody = await res.text();
      let body: JsonValue = rawBody;
      try {
        body = JSON.parse(rawBody) as JsonValue;
      } catch {
        /* keep raw */
      }
      const outHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        outHeaders[k] = v;
      });
      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        latencyMs,
        headers: outHeaders,
        body,
        rawBody,
        finalUrl,
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - t0);
      return {
        ok: false,
        status: 0,
        statusText: "Network Error",
        latencyMs,
        headers: {},
        body: null,
        rawBody: "",
        error: err instanceof Error ? err.message : String(err),
        finalUrl,
      };
    } finally {
      clearTimeout(timeout);
    }
  });

export const deepCheckModels = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => DeepCheckInput.parse(data))
  .handler(async ({ data }): Promise<DeepCheckResult> => {
    if (!data.apiKey.trim()) {
      throw new Error("Deep check requires an API key.");
    }
    if (data.provider === "gemini") {
      throw new Error("Deep check is currently for OpenAI-compatible and Anthropic-compatible APIs.");
    }

    const provider = data.provider as ProviderId;
    const headers = new Headers();
    headers.set("Accept", "application/json");
    applyCustomHeaders(headers, data.headers);

    const modelsUrl = buildEndpoint(data.url, "/models", provider);
    const finalModelsUrl = applyAuth(modelsUrl, headers, provider, data.apiKey);
    const listedResponse = await fetchJson(finalModelsUrl, { method: "GET", headers }, data.timeoutMs);

    if (!listedResponse.ok) {
      throw new Error(`GET /models failed: HTTP ${listedResponse.status}: ${extractError(listedResponse.body)}`);
    }

    const listedModels = parseModels(listedResponse.body, provider);
    if (!listedModels.length) {
      throw new Error("No model IDs found in /models response.");
    }

    const checkedModels = await mapWithConcurrency(listedModels, data.workers, (model) =>
      probeModel(model, data.url, provider, data.apiKey, data.headers, data.timeoutMs),
    );

    const activeModels = checkedModels.filter((model) => model.status === "active");

    return {
      models: activeModels.sort((a, b) => {
        if (a.status === "active" && b.status !== "active") return -1;
        if (a.status !== "active" && b.status === "active") return 1;
        return a.id.localeCompare(b.id);
      }),
      checked: checkedModels.length,
      active: activeModels.length,
      listed: listedModels.length,
    };
  });
