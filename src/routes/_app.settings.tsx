import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";
import { Trash2, Timer, RefreshCw, Wand2, Bell, Save } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — AI Endpoint Checker" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useI18n();
  const { clearAll, history, keys } = useAppStore();

  const [defaultMethod, setDefaultMethod] = useLocalStorage<"GET" | "POST">(
    "aec.pref.method",
    "GET",
  );
  const [defaultProvider, setDefaultProvider] = useLocalStorage<string>(
    "aec.pref.provider",
    "auto",
  );
  const [timeoutMs, setTimeoutMs] = useLocalStorage<number>("aec.pref.timeout", 10000);
  const [autoRefresh, setAutoRefresh] = useLocalStorage<boolean>("aec.pref.autoRefresh", false);
  const [refreshInterval, setRefreshInterval] = useLocalStorage<number>(
    "aec.pref.refreshInterval",
    30,
  );
  const [prettyJson, setPrettyJson] = useLocalStorage<boolean>("aec.pref.prettyJson", true);
  const [notify, setNotify] = useLocalStorage<boolean>("aec.pref.notify", true);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Atur preferensi default untuk Endpoint Checker. Tema & bahasa tersedia di pojok kanan
          atas.
        </p>
      </div>

      {/* Defaults */}
      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Wand2 className="size-4 text-primary" />
          Default Request
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-sm">Default Method</Label>
            <Select
              value={defaultMethod}
              onValueChange={(v) => setDefaultMethod(v as "GET" | "POST")}
            >
              <SelectTrigger className="bg-background/40 border-white/10 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm">Default Provider</Label>
            <Select value={defaultProvider} onValueChange={setDefaultProvider}>
              <SelectTrigger className="bg-background/40 border-white/10 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto Detect</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label className="text-sm flex items-center gap-1.5">
              <Timer className="size-3.5" /> Request Timeout (ms)
            </Label>
            <Input
              type="number"
              min={1000}
              step={500}
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(Number(e.target.value) || 10000)}
              className="bg-background/40 border-white/10 h-11"
            />
            <p className="text-xs text-muted-foreground">
              Batas waktu maksimal untuk setiap request endpoint (default 10.000 ms).
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <RefreshCw className="size-4 text-primary" />
          Dashboard
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <Label className="text-sm">Auto Refresh</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Otomatis perbarui statistik dashboard berdasarkan interval.
            </p>
          </div>
          <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
        </div>

        <div className="grid gap-2">
          <Label className="text-sm">Interval (detik)</Label>
          <Input
            type="number"
            min={5}
            step={5}
            disabled={!autoRefresh}
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value) || 30)}
            className="bg-background/40 border-white/10 h-11"
          />
        </div>
      </section>

      {/* Response viewer */}
      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Save className="size-4 text-primary" />
          Response Viewer
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <Label className="text-sm">Format JSON Otomatis</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Tampilkan response dengan pretty print (indentasi).
            </p>
          </div>
          <Switch checked={prettyJson} onCheckedChange={setPrettyJson} />
        </div>

        <div className="flex items-start justify-between gap-4 pt-2 border-t border-white/5">
          <div>
            <Label className="text-sm flex items-center gap-1.5">
              <Bell className="size-3.5" /> Notifikasi Toast
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Tampilkan notifikasi saat request selesai.
            </p>
          </div>
          <Switch checked={notify} onCheckedChange={setNotify} />
        </div>
      </section>

      {/* Data */}
      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Trash2 className="size-4 text-rose-400" />
          Manajemen Data
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-white/5 bg-background/30 px-4 py-3">
            <div className="text-muted-foreground text-xs">Total Riwayat</div>
            <div className="text-xl font-semibold mt-0.5">{history.length}</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-background/30 px-4 py-3">
            <div className="text-muted-foreground text-xs">API Keys Tersimpan</div>
            <div className="text-xl font-semibold mt-0.5">{keys.length}</div>
          </div>
        </div>
        <Button
          variant="outline"
          className="text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10"
          onClick={() => {
            clearAll();
            toast.success(t("toast.deleted"));
          }}
        >
          <Trash2 className="size-4 mr-2" /> {t("settings.clear")}
        </Button>
      </section>
    </div>
  );
}
