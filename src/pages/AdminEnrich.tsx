import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrich-all`;
const PLACES_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrich-from-places`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function AdminEnrich() {
  const [token, setToken] = useState<string>(() => sessionStorage.getItem("enrich_token") ?? "");
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"pending" | "failed">("pending");
  const [log, setLog] = useState<string[]>([]);
  const [placesRunning, setPlacesRunning] = useState(false);
  const [placesLog, setPlacesLog] = useState<string[]>([]);

  useEffect(() => {
    if (token) sessionStorage.setItem("enrich_token", token);
  }, [token]);

  const stats = useQuery({
    queryKey: ["enrich-stats"],
    queryFn: async () => {
      const [{ count: totalWithSite }, { count: doneCount }, { count: failedCount }, { count: skippedCount }] = await Promise.all([
        supabase.from("bars").select("id", { count: "exact", head: true }).not("website", "is", null),
        supabase.from("bar_enrichment_runs").select("id", { count: "exact", head: true }).eq("status", "done"),
        supabase.from("bar_enrichment_runs").select("id", { count: "exact", head: true }).eq("status", "failed"),
        supabase.from("bar_enrichment_runs").select("id", { count: "exact", head: true }).eq("status", "skipped"),
      ]);
      return {
        total: totalWithSite ?? 0,
        done: doneCount ?? 0,
        failed: failedCount ?? 0,
        skipped: skippedCount ?? 0,
        pending: Math.max(0, (totalWithSite ?? 0) - (doneCount ?? 0) - (failedCount ?? 0) - (skippedCount ?? 0)),
      };
    },
    refetchInterval: running ? 3000 : 15000,
  });

  const recentErrors = useQuery({
    queryKey: ["enrich-errors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bar_enrichment_runs")
        .select("bar_id, error, updated_at, bars(name)")
        .eq("status", "failed")
        .order("updated_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    refetchInterval: running ? 5000 : 30000,
  });

  const placesStats = useQuery({
    queryKey: ["places-stats"],
    queryFn: async () => {
      const [{ count: missing }, { count: done }, { count: failed }, { count: notFound }] = await Promise.all([
        supabase.from("bars").select("id", { count: "exact", head: true }).or("website.is.null,image_url.is.null"),
        supabase.from("bar_places_runs").select("bar_id", { count: "exact", head: true }).eq("status", "done"),
        supabase.from("bar_places_runs").select("bar_id", { count: "exact", head: true }).eq("status", "failed"),
        supabase.from("bar_places_runs").select("bar_id", { count: "exact", head: true }).eq("status", "not_found"),
      ]);
      return { missing: missing ?? 0, done: done ?? 0, failed: failed ?? 0, notFound: notFound ?? 0 };
    },
    refetchInterval: placesRunning ? 3000 : 15000,
  });

  const appendLog = (m: string) => setLog((l) => [`${new Date().toLocaleTimeString()} · ${m}`, ...l].slice(0, 100));
  const appendPlacesLog = (m: string) => setPlacesLog((l) => [`${new Date().toLocaleTimeString()} · ${m}`, ...l].slice(0, 100));

  async function callPlacesBatch(mode: "missing" | "retry") {
    const res = await fetch(PLACES_FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON}`,
        "x-enrich-token": token,
      },
      body: JSON.stringify({ batch_size: 5, mode }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
    return j as { done: boolean; processed: number; succeeded?: number; failed?: number };
  }

  async function startPlaces(mode: "missing" | "retry") {
    if (!token) {
      toast({ title: "Token required", description: "Paste the admin token first.", variant: "destructive" });
      return;
    }
    setPlacesRunning(true);
    appendPlacesLog(`Starting Google Places ${mode} run…`);
    try {
      while (true) {
        const r = await callPlacesBatch(mode);
        appendPlacesLog(`Batch: processed ${r.processed}, ok ${r.succeeded ?? 0}, failed ${r.failed ?? 0}`);
        placesStats.refetch();
        if (r.done || r.processed === 0) {
          appendPlacesLog("No more bars to process — stopped.");
          break;
        }
        await new Promise((r) => setTimeout(r, 800));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      appendPlacesLog(`Error: ${msg}`);
      toast({ title: "Places run stopped", description: msg, variant: "destructive" });
    } finally {
      setPlacesRunning(false);
    }
  }

  async function callBatch() {
    const res = await fetch(FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON}`,
        "x-enrich-token": token,
      },
      body: JSON.stringify({ batch_size: 5, mode }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
    return j as { done: boolean; processed: number; succeeded?: number; failed?: number };
  }

  async function start() {
    if (!token) {
      toast({ title: "Token required", description: "Paste the admin token to enable scraping.", variant: "destructive" });
      return;
    }
    setRunning(true);
    appendLog(`Starting ${mode} run…`);
    try {
      while (true) {
        const r = await callBatch();
        appendLog(`Batch: processed ${r.processed}, ok ${r.succeeded ?? 0}, failed ${r.failed ?? 0}`);
        stats.refetch();
        if (r.done || r.processed === 0) {
          appendLog("No more bars in queue — stopped.");
          break;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      appendLog(`Error: ${msg}`);
      toast({ title: "Run stopped", description: msg, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bar enrichment</h1>
          <p className="text-muted-foreground mt-1">Firecrawl + Google Places pipelines. Hidden admin page.</p>
        </div>

        <Card className="p-5 space-y-3">
          <label className="text-sm font-medium text-foreground">Admin token</label>
          <Input
            type="password"
            placeholder="ENRICH_ADMIN_TOKEN value"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Stored in session storage only.</p>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="With website" value={stats.data?.total ?? "—"} />
          <Stat label="Done" value={stats.data?.done ?? "—"} />
          <Stat label="Pending" value={stats.data?.pending ?? "—"} />
          <Stat label="Failed" value={stats.data?.failed ?? "—"} />
          <Stat label="Skipped" value={stats.data?.skipped ?? "—"} />
        </div>

        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant={mode === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("pending")}
              disabled={running}
            >
              Pending bars
            </Button>
            <Button
              variant={mode === "failed" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("failed")}
              disabled={running}
            >
              Retry failed
            </Button>
            <div className="flex-1" />
            <Button onClick={start} disabled={running || !token}>
              {running ? "Running…" : "Start"}
            </Button>
          </div>
          {stats.data && (
            <div className="w-full bg-muted h-2 rounded">
              <div
                className="bg-accent h-2 rounded transition-all"
                style={{ width: `${stats.data.total ? Math.round(((stats.data.done + stats.data.skipped) / stats.data.total) * 100) : 0}%` }}
              />
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-3">Run log</h2>
          <pre className="text-xs bg-muted/50 p-3 rounded max-h-64 overflow-auto whitespace-pre-wrap">
            {log.length ? log.join("\n") : "Idle."}
          </pre>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-3">Recent errors</h2>
          {(recentErrors.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">None.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(recentErrors.data ?? []).map((r: any) => (
                <li key={r.bar_id} className="border-b border-border pb-2 last:border-0">
                  <div className="font-medium text-foreground">{r.bars?.name ?? r.bar_id}</div>
                  <div className="text-muted-foreground text-xs">{r.error}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="pt-4 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground">Google Places enrichment</h2>
          <p className="text-muted-foreground text-sm mt-1">
            For bars missing a website or image. Pulls website, phone, hours, and a hero photo from Google Maps.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Need data" value={placesStats.data?.missing ?? "—"} />
          <Stat label="Done" value={placesStats.data?.done ?? "—"} />
          <Stat label="Not found" value={placesStats.data?.notFound ?? "—"} />
          <Stat label="Failed" value={placesStats.data?.failed ?? "—"} />
        </div>

        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={() => startPlaces("missing")} disabled={placesRunning || !token}>
              {placesRunning ? "Running…" : "Start Places run"}
            </Button>
            <Button variant="outline" onClick={() => startPlaces("retry")} disabled={placesRunning || !token}>
              Retry failed
            </Button>
          </div>
          <pre className="text-xs bg-muted/50 p-3 rounded max-h-64 overflow-auto whitespace-pre-wrap">
            {placesLog.length ? placesLog.join("\n") : "Idle."}
          </pre>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </Card>
  );
}