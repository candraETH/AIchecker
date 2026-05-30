import { useMemo, useState } from "react";
import { Copy, Braces } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  value: unknown;
  className?: string;
  maxHeight?: number;
}

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = "text-amber-300";
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "text-sky-300" : "text-emerald-300";
        } else if (/true|false/.test(match)) cls = "text-purple-300";
        else if (/null/.test(match)) cls = "text-rose-300";
        return `<span class="${cls}">${match}</span>`;
      },
    );
}

export function JsonViewer({ value, className, maxHeight = 480 }: Props) {
  const [pretty, setPretty] = useState(true);

  const text = useMemo(() => {
    if (value == null) return "";
    if (typeof value === "string") {
      try {
        return JSON.stringify(JSON.parse(value), null, pretty ? 2 : 0);
      } catch {
        return value;
      }
    }
    try {
      return JSON.stringify(value, null, pretty ? 2 : 0);
    } catch {
      return String(value);
    }
  }, [value, pretty]);

  const html = useMemo(() => syntaxHighlight(text), [text]);
  const lines = text.split("\n");

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className={cn("rounded-xl border bg-card/60 overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card/40">
        <span className="text-xs text-muted-foreground font-mono">JSON</span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setPretty((p) => !p)}>
            <Braces className="size-3.5 mr-1" />
            Format
          </Button>
          <Button size="sm" variant="ghost" onClick={copy}>
            <Copy className="size-3.5 mr-1" />
            Copy
          </Button>
        </div>
      </div>
      <div className="overflow-auto" style={{ maxHeight }}>
        <div className="flex font-mono text-xs leading-relaxed">
          <div className="px-3 py-3 text-right text-muted-foreground/60 border-r select-none bg-card/40">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre
            className="px-4 py-3 flex-1 whitespace-pre"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
