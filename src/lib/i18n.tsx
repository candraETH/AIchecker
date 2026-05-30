import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "id" | "en";

type Dict = Record<string, string>;

const ID: Dict = {
  "app.title": "AI Endpoint Checker",
  "app.subtitle": "Cek endpoint AI dan pantau model yang terdaftar secara real-time",
  "nav.dashboard": "Dashboard",
  "nav.checker": "Cek Endpoint",
  "nav.models": "Models",
  "nav.keys": "API Keys",
  "nav.logs": "API Logs",
  "nav.history": "Riwayat",
  "nav.analytics": "Analytics",
  "nav.providers": "Providers",
  "nav.docs": "Dokumentasi",
  "nav.settings": "Pengaturan",
  "status.online": "Online",
  "status.system": "Status Sistem",
  "status.normal": "Semua sistem berjalan normal",
  "card.status": "Status",
  "card.status.sub": "Request berhasil",
  "card.models": "Model Terdaftar",
  "card.models.sub": "Model dari endpoint",
  "card.response": "Response Time",
  "card.response.sub": "Waktu respons",
  "card.provider": "Provider",
  "card.provider.sub": "Penyedia AI",
  "form.title": "Cek Endpoint AI",
  "form.url": "Endpoint URL",
  "form.method": "Method",
  "form.apikey": "API Key (Opsional)",
  "form.provider": "Provider",
  "form.headers": "Headers (JSON, opsional)",
  "form.body": "Body (JSON, opsional)",
  "form.example": "Contoh:",
  "form.submit": "Cek Endpoint",
  "form.loading": "Memeriksa...",
  "form.deepCheck": "Deep check model",
  "form.deepHint": "Probe tiap model lewat request chat kecil. Bisa memakai kuota dan terkena rate limit.",
  "models.title": "Model AI yang Tersedia",
  "models.search": "Cari model...",
  "models.empty": "Belum ada model. Jalankan endpoint check terlebih dahulu.",
  "models.col.id": "Model ID",
  "models.col.name": "Nama Model",
  "models.col.provider": "Provider",
  "models.col.status": "Status",
  "models.col.context": "Context Window",
  "models.col.created": "Dibuat",
  "models.active": "Aktif",
  "models.inactive": "Tidak Aktif",
  "models.listed": "Terdaftar",
  "models.unknown": "Tidak Diketahui",
  "models.not_chat_or_inactive": "Bukan Chat / Tidak Aktif",
  "models.no_access": "Tidak Ada Akses",
  "models.rate_limited": "Rate Limited",
  "models.error": "Error",
  "response.title": "Response JSON",
  "response.copy": "Salin",
  "response.format": "Format",
  "response.empty": "Jalankan endpoint check untuk melihat response.",
  "history.title": "Riwayat",
  "history.empty": "Belum ada riwayat.",
  "history.export": "Export CSV",
  "history.clear": "Hapus Semua",
  "keys.title": "API Keys",
  "keys.add": "Tambah Key",
  "keys.label": "Label",
  "keys.save": "Simpan",
  "keys.delete": "Hapus",
  "keys.warning": "Key disimpan di browser (localStorage). Jangan gunakan di perangkat publik.",
  "analytics.title": "Analytics",
  "analytics.requests": "Total Request",
  "analytics.avgLatency": "Rata-rata Latency",
  "analytics.successRate": "Success Rate",
  "analytics.byProvider": "Penggunaan per Provider",
  "analytics.latencyTrend": "Tren Response Time",
  "settings.title": "Pengaturan",
  "settings.theme": "Tema",
  "settings.lang": "Bahasa",
  "settings.dark": "Gelap",
  "settings.light": "Terang",
  "settings.system": "Sistem",
  "settings.clear": "Hapus Semua Data",
  "providers.title": "Providers",
  "docs.title": "Dokumentasi",
  "logs.title": "API Logs",
  "logs.empty": "Belum ada log.",
  "toast.checked": "Endpoint diperiksa",
  "toast.copied": "Disalin ke clipboard",
  "toast.saved": "Disimpan",
  "toast.deleted": "Dihapus",
  "common.cancel": "Batal",
  "common.search": "Cari",
  "common.filter": "Filter",
  "common.all": "Semua",
};

const EN: Dict = {
  "app.title": "AI Endpoint Checker",
  "app.subtitle": "Check AI endpoints and monitor listed models in real-time",
  "nav.dashboard": "Dashboard",
  "nav.checker": "Endpoint Checker",
  "nav.models": "Models",
  "nav.keys": "API Keys",
  "nav.logs": "API Logs",
  "nav.history": "History",
  "nav.analytics": "Analytics",
  "nav.providers": "Providers",
  "nav.docs": "Documentation",
  "nav.settings": "Settings",
  "status.online": "Online",
  "status.system": "System Status",
  "status.normal": "All systems normal",
  "card.status": "Status",
  "card.status.sub": "Request successful",
  "card.models": "Listed Models",
  "card.models.sub": "Models from endpoint",
  "card.response": "Response Time",
  "card.response.sub": "Response time",
  "card.provider": "Provider",
  "card.provider.sub": "AI provider",
  "form.title": "Check AI Endpoint",
  "form.url": "Endpoint URL",
  "form.method": "Method",
  "form.apikey": "API Key (Optional)",
  "form.provider": "Provider",
  "form.headers": "Headers (JSON, optional)",
  "form.body": "Body (JSON, optional)",
  "form.example": "Example:",
  "form.submit": "Check Endpoint",
  "form.loading": "Checking...",
  "form.deepCheck": "Deep check models",
  "form.deepHint": "Probe each model with a tiny chat request. This may use quota and hit rate limits.",
  "models.title": "Available AI Models",
  "models.search": "Search models...",
  "models.empty": "No models yet. Run an endpoint check first.",
  "models.col.id": "Model ID",
  "models.col.name": "Model Name",
  "models.col.provider": "Provider",
  "models.col.status": "Status",
  "models.col.context": "Context Window",
  "models.col.created": "Created",
  "models.active": "Active",
  "models.inactive": "Inactive",
  "models.listed": "Listed",
  "models.unknown": "Unknown",
  "models.not_chat_or_inactive": "Not Chat / Inactive",
  "models.no_access": "No Access",
  "models.rate_limited": "Rate Limited",
  "models.error": "Error",
  "response.title": "Response JSON",
  "response.copy": "Copy",
  "response.format": "Format",
  "response.empty": "Run an endpoint check to see the response.",
  "history.title": "History",
  "history.empty": "No history yet.",
  "history.export": "Export CSV",
  "history.clear": "Clear All",
  "keys.title": "API Keys",
  "keys.add": "Add Key",
  "keys.label": "Label",
  "keys.save": "Save",
  "keys.delete": "Delete",
  "keys.warning": "Keys are stored in your browser (localStorage). Do not use on shared devices.",
  "analytics.title": "Analytics",
  "analytics.requests": "Total Requests",
  "analytics.avgLatency": "Average Latency",
  "analytics.successRate": "Success Rate",
  "analytics.byProvider": "Usage by Provider",
  "analytics.latencyTrend": "Response Time Trend",
  "settings.title": "Settings",
  "settings.theme": "Theme",
  "settings.lang": "Language",
  "settings.dark": "Dark",
  "settings.light": "Light",
  "settings.system": "System",
  "settings.clear": "Clear All Data",
  "providers.title": "Providers",
  "docs.title": "Documentation",
  "logs.title": "API Logs",
  "logs.empty": "No logs yet.",
  "toast.checked": "Endpoint checked",
  "toast.copied": "Copied to clipboard",
  "toast.saved": "Saved",
  "toast.deleted": "Deleted",
  "common.cancel": "Cancel",
  "common.search": "Search",
  "common.filter": "Filter",
  "common.all": "All",
};

const DICTS: Record<Lang, Dict> = { id: ID, en: EN };

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("aec.lang") as Lang | null;
    if (stored === "id" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("aec.lang", l);
  };

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      setLang,
      t: (key) => DICTS[lang][key] ?? key,
    }),
    [lang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const v = useContext(Ctx);
  if (!v) return { lang: "id", setLang: () => {}, t: (k) => DICTS.id[k] ?? k };
  return v;
}
