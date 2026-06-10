import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useServerFn } from "@tanstack/react-start";
import { analyzeWebsite } from "@/lib/analyzer.functions";
import { useState } from "react";
import { Loader2, MousePointerClick, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/conversion-analyzer")({
  head: () => ({ meta: [
    { title: "Conversion Analyzer | SaleshubsWebTeam" },
    { name: "description", content: "Score your store's CTAs, trust signals and checkout UX from a live page scan." },
  ]}),
  component: Page,
});

type R = Extract<Awaited<ReturnType<typeof analyzeWebsite>>, { ok: true }>;

function Page() {
  const analyze = useServerFn(analyzeWebsite);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [r, setR] = useState<R | null>(null);

  const run = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;
    setLoading(true); setErr(null); setR(null);
    try {
      const res = await analyze({ data: { url: url.trim() } });
      if (res.ok) setR(res); else setErr(res.error);
    } catch (x: any) { setErr(x?.message ?? "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Conversion Analyzer"
        title={<>Where your store <span className="text-gradient-brand">leaks revenue</span>.</>}
        subtitle="Live audit of CTAs, trust signals, mobile UX and checkout readiness."
      />
      <section className="pb-24 mx-auto max-w-5xl px-4">
        <form onSubmit={run} className="glass-strong rounded-3xl p-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 glass rounded-xl px-4">
            <MousePointerClick className="w-4 h-4 text-muted-foreground"/>
            <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://yourstore.com" className="flex-1 bg-transparent outline-none text-sm py-3"/>
          </div>
          <button disabled={loading} className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
            {loading ? "Scanning…" : "Score conversion"}
          </button>
        </form>

        {err && (
          <div className="mt-6 glass rounded-2xl p-4 border border-red-500/30 flex gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0"/>
            <p className="text-muted-foreground">{err}</p>
          </div>
        )}

        {r && (
          <div className="mt-8 space-y-4">
            <div className="glass-strong rounded-3xl p-8 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Conversion score</p>
              <p className="text-7xl font-semibold text-gradient mt-2">{r.audit.scores.conversion}</p>
              <p className="text-xs text-muted-foreground mt-1">/ 100 · UX {r.audit.scores.ux} · Mobile {r.audit.scores.mobile}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-sm font-medium mb-3">Action items</p>
              <ul className="space-y-3 text-sm">
                {r.audit.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md shrink-0 self-start ${rec.priority==="high"?"bg-red-500/15 text-red-300":rec.priority==="medium"?"bg-amber-500/15 text-amber-300":"bg-white/5 text-muted-foreground"}`}>{rec.priority}</span>
                    <div>
                      <p className="font-medium">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">{rec.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}