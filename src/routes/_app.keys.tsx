import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { PROVIDERS, type ProviderId, getProvider } from "@/lib/providers";

export const Route = createFileRoute("/_app/keys")({
  head: () => ({ meta: [{ title: "API Keys — AI Endpoint Checker" }] }),
  component: KeysPage,
});

function mask(k: string) {
  if (k.length <= 8) return "•".repeat(k.length);
  return `${k.slice(0, 4)}${"•".repeat(Math.max(4, k.length - 8))}${k.slice(-4)}`;
}

function KeysPage() {
  const { t } = useI18n();
  const { keys, addKey, deleteKey } = useAppStore();
  const [provider, setProvider] = useState<ProviderId>("openai");
  const [label, setLabel] = useState("");
  const [keyVal, setKeyVal] = useState("");
  const [shown, setShown] = useState<Record<string, boolean>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyVal.trim()) return;
    addKey({
      id: crypto.randomUUID(),
      provider,
      label: label.trim() || getProvider(provider).name,
      key: keyVal.trim(),
      createdAt: Date.now(),
    });
    setLabel("");
    setKeyVal("");
    toast.success(t("toast.saved"));
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("keys.title")}</h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-400" />
          {t("keys.warning")}
        </p>
      </div>

      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 md:p-6">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-3">
            <Label className="text-xs text-muted-foreground mb-2 block">{t("form.provider")}</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as ProviderId)}>
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
          <div className="md:col-span-3">
            <Label className="text-xs text-muted-foreground mb-2 block">{t("keys.label")}</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Production"
              className="bg-background/40 border-white/10 h-11"
            />
          </div>
          <div className="md:col-span-4">
            <Label className="text-xs text-muted-foreground mb-2 block">{t("form.apikey")}</Label>
            <Input
              type="password"
              value={keyVal}
              onChange={(e) => setKeyVal(e.target.value)}
              placeholder="sk-..."
              className="bg-background/40 border-white/10 h-11"
              required
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <Button type="submit" className="h-11 w-full">
              <Plus className="size-4 mr-2" /> {t("keys.add")}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border bg-card/40 backdrop-blur-md p-5 md:p-6">
        <h2 className="text-lg font-semibold mb-4">{t("keys.title")}</h2>
        {keys.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No keys yet.</div>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl border bg-card/60"
              >
                <div className="md:w-32 text-sm font-medium">{getProvider(k.provider).name}</div>
                <div className="md:w-40 text-sm text-muted-foreground">{k.label}</div>
                <div className="flex-1 font-mono text-xs flex items-center gap-2">
                  <span className="truncate">{shown[k.id] ? k.key : mask(k.key)}</span>
                  <button
                    onClick={() => setShown((s) => ({ ...s, [k.id]: !s[k.id] }))}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="toggle"
                  >
                    {shown[k.id] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(k.createdAt).toLocaleDateString()}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deleteKey(k.id);
                    toast.success(t("toast.deleted"));
                  }}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
