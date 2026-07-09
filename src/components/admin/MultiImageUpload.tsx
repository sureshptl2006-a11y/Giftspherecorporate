import { useState } from "react";
import { Upload, Loader2, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadMedia } from "@/lib/uploadMedia";

export function MultiImageUpload({
  value,
  onChange,
  folder = "products",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        urls.push(await uploadMedia(f, folder));
      }
      onChange([...(value ?? []), ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function addUrl() {
    const u = pasteUrl.trim();
    if (!u) return;
    onChange([...(value ?? []), u]);
    setPasteUrl("");
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" type="button" disabled={busy}>
          <label className="cursor-pointer">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span className="ml-2">Upload images</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={busy} />
          </label>
        </Button>
        <Input
          value={pasteUrl}
          onChange={(e) => setPasteUrl(e.target.value)}
          placeholder="or paste image URL"
          className="flex-1 min-w-[200px]"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
        />
        <Button type="button" variant="secondary" onClick={addUrl} disabled={!pasteUrl.trim()}>Add URL</Button>
      </div>

      {value?.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {value.map((url, i) => (
            <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-card">
              <img src={url} alt={`#${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-navy/90 px-1.5 py-0.5 text-[10px] font-medium text-ivory">Main</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/70 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="rounded bg-white/90 px-1 text-xs">◀</button>
                  <button type="button" onClick={() => move(i, 1)} className="rounded bg-white/90 px-1 text-xs">▶</button>
                </div>
                <button type="button" onClick={() => remove(i)} className="rounded bg-destructive px-1.5 text-xs text-destructive-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        <GripVertical className="inline h-3 w-3" /> First image is the main thumbnail. Use ◀ ▶ to reorder.
      </p>
    </div>
  );
}
