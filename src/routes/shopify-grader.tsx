import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useServerFn } from "@tanstack/react-start";
import { analyzeWebsite } from "@/lib/analyzer.functions";
import { useState } from "react";
import { Loader2, ShoppingBag, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/shopify-grader")({
  head: () => ({ meta: [
    { title: "Shopify Store Grader | SaleshubsWebTeam" },
    { name: "description", content: "Score your Shopify store's speed, trust signals, mobile UX and SEO — live." },
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

  const scores = r?.audit.scores;
  const html = (r?.audit as any)?.summary as string | undefined;
  const isShopify = html ? /shopify/i.test(html) : false;

  const grades = scores ? [
    { label: "Theme speed", v: scores.performance },
    { label: "Mobile optimization", v: scores.mobile },
    { label: "SEO foundations", v: scores.seo },
    { label: "User experience", v: scores.ux },
    { label: "Conversion readiness", v: scores.conversion },
    { label: "Accessibility", v: scores.accessibility },
  ] : [];

  const overall = scores ? Math.round((scores.performance + scores.mobile + scores.seo + scores.ux + scores.conversion + scores.accessibility) / 6) : 0;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Shopify Grader"
        title={<>Grade any <span className="text-gradient-brand">Shopify store</span> in 30 seconds.</>}
        subtitle="Real Lighthouse audit + live page crawl. No fake scores."
      />
      <section className="pb-24 mx-auto max-w-5xl px-4">
        <form onSubmit={run} className="glass-strong rounded-3xl p-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 glass rounded-xl px-4">
            <ShoppingBag className="w-4 h-4 text-muted-foreground"/>
            <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://yourstore.myshopify.com" className="flex-1 bg-transparent outline-none text-sm py-3"/>
          </div>
          <button disabled={loading} className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
            {loading ? "Grading…" : "Grade store"}
          </button>
        </form>

        {err && (
          <div className="mt-6 glass rounded-2xl p-4 border border-red-500/30 flex gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0"/>
            <p className="text-muted-foreground">{err}</p>
          </div>
        )}

        {r && scores && (
          <div className="mt-8 space-y-6">
            <div className="glass-strong rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide">Overall grade</p>
                <p className="text-6xl font-semibold text-gradient mt-2">{overall}</p>
                <p className="text-xs text-muted-foreground">{isShopify ? "Shopify detected" : "Shopify not detected — generic store audit"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1 max-w-lg">
                {grades.map(g => (
                  <div key={g.label} className="glass rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{g.label}</p>
                    <p className="text-xl font-semibold mt-1">{g.v}/100</p>
                    <div className="h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                      <div className="h-full bg-gradient-brand" style={{width: `${g.v}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <p className="text-sm font-medium mb-3">Priority fixes</p>
              <ul className="space-y-3 text-sm">
                {r.audit.recommendations.slice(0, 8).map((rec, i) => (
                  <li key={i} className="flex gap-3">
                    {rec.priority === "high" ? <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0"/>
                      : rec.priority === "medium" ? <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0"/>
                      : <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"/>}
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