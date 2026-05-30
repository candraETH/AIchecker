import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CheckResult } from "@/lib/check.functions";
import type { NormalizedModel, ProviderId } from "@/lib/providers";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  url: string;
  method: "GET" | "POST";
  provider: ProviderId;
  status: number;
  latencyMs: number;
  ok: boolean;
}

export interface ApiKey {
  id: string;
  provider: ProviderId;
  label: string;
  key: string;
  createdAt: number;
}

interface AppStore {
  lastResult: CheckResult | null;
  lastProvider: ProviderId | null;
  lastUrl: string;
  models: NormalizedModel[];
  history: HistoryEntry[];
  keys: ApiKey[];

  setResult: (r: CheckResult, provider: ProviderId, url: string, models: NormalizedModel[]) => void;
  addHistory: (e: HistoryEntry) => void;
  clearHistory: () => void;
  addKey: (k: ApiKey) => void;
  updateKey: (id: string, patch: Partial<ApiKey>) => void;
  deleteKey: (id: string) => void;
  clearAll: () => void;
}

const HISTORY_KEY = "aec.history";
const KEYS_KEY = "aec.keys";
const LAST_KEY = "aec.last";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const Ctx = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [lastResult, setLastResult] = useState<CheckResult | null>(null);
  const [lastProvider, setLastProvider] = useState<ProviderId | null>(null);
  const [lastUrl, setLastUrl] = useState("");
  const [models, setModels] = useState<NormalizedModel[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    setHistory(safeParse<HistoryEntry[]>(localStorage.getItem(HISTORY_KEY), []));
    setKeys(safeParse<ApiKey[]>(localStorage.getItem(KEYS_KEY), []));
    const last = safeParse<{
      result: CheckResult;
      provider: ProviderId;
      url: string;
      models: NormalizedModel[];
    } | null>(localStorage.getItem(LAST_KEY), null);
    if (last) {
      setLastResult(last.result);
      setLastProvider(last.provider);
      setLastUrl(last.url);
      setModels(last.models);
    }
  }, []);

  const setResult = useCallback<AppStore["setResult"]>((r, provider, url, m) => {
    setLastResult(r);
    setLastProvider(provider);
    setLastUrl(url);
    setModels(m);
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify({ result: r, provider, url, models: m }));
    } catch {
      /* ignore */
    }
  }, []);

  const addHistory = useCallback<AppStore["addHistory"]>((e) => {
    setHistory((prev) => {
      const next = [e, ...prev].slice(0, 500);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const addKey = useCallback<AppStore["addKey"]>((k) => {
    setKeys((prev) => {
      const next = [...prev, k];
      localStorage.setItem(KEYS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateKey = useCallback<AppStore["updateKey"]>((id, patch) => {
    setKeys((prev) => {
      const next = prev.map((k) => (k.id === id ? { ...k, ...patch } : k));
      localStorage.setItem(KEYS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteKey = useCallback<AppStore["deleteKey"]>((id) => {
    setKeys((prev) => {
      const next = prev.filter((k) => k.id !== id);
      localStorage.setItem(KEYS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setHistory([]);
    setKeys([]);
    setLastResult(null);
    setModels([]);
    setLastProvider(null);
    setLastUrl("");
    [HISTORY_KEY, KEYS_KEY, LAST_KEY].forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });
  }, []);

  const value = useMemo<AppStore>(
    () => ({
      lastResult,
      lastProvider,
      lastUrl,
      models,
      history,
      keys,
      setResult,
      addHistory,
      clearHistory,
      addKey,
      updateKey,
      deleteKey,
      clearAll,
    }),
    [
      lastResult,
      lastProvider,
      lastUrl,
      models,
      history,
      keys,
      setResult,
      addHistory,
      clearHistory,
      addKey,
      updateKey,
      deleteKey,
      clearAll,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore(): AppStore {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppStore must be used within AppStoreProvider");
  return v;
}
