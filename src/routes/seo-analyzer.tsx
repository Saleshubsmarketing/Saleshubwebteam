import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Search, FileText, Hash, Loader2, AlertTriangle, CheckCircle2, AlertCircle, Globe, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeWebsite } from "@/lib/analyzer.functions";

export const Route = createFileRoute("/seo-analyzer")({
  head: () => ({
    meta: [
      { title: "Free SEO Analyzer | SaleshubsWebOffice" },
      { name: "description", content: "Real-time SEO scan: on-page tags, schema, robots/sitemap and Google Lighthouse SEO score." },
    ],
  }),
  component: SEOAnalyzerPage,
});

type AnalyzeResult = Awaited<ReturnType<typeof analyzeWebsite>>;
type OkResult = Extract<AnalyzeResult, { ok: true }>;

function SEOAnalyzerPage() {
  const analyze = useServerFn(analyzeWebsite);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OkResult | null>(null);

  const run = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await analyze({ data: { url: url.trim() } });
      if (r.ok) setResult(r);
      else setError(r.error);
    } catch (err: any) {
      setError(err?.message ?? "Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  const seoCat = result?.audit.categories.find((c) => c.name === "SEO");
  const seoScore = result?.audit.scores.seo ?? 0;
  const s = result?.seoSignals;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="SEO Analyzer"
        title={<>Find every <span className="text-gradient">SEO win</span> hiding in your store.</>}
        subtitle="Real-time scan: on-page tags, robots.txt, sitemap.xml, structured data and Google Lighthouse SEO score."
      />
      <section className="pb-24 mx-auto max-w-5xl px-4">
        <div className="glass-strong rounded-3xl p-6 md:p-10">
          <form onSubmit={run} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 glass rounded-xl px-4">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourstore.com"
                className="flex-1 bg-transparent outline-none text-sm py-3"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium flex items-center justify-center gap-2 min-w-[150px] disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Scanning…" : "Analyze SEO"}
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            Live page fetch and audit. Lighthouse data may take up to 30 seconds.
          </p>

          {error && (
            <div className="mt-6 glass rounded-2xl p-4 border border-red-500/30 flex gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="font-medium text-red-300">Scan failed</p>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {result && s && (
            <div className="mt-8 space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <ScoreCard icon={Search} label="SEO score" value={`${seoScore}/100`} accent />
                <ScoreCard icon={Hash} label="H1 / H2" value={`${s.h1Count} / ${s.h2Count}`} />
                <ScoreCard icon={FileText} label="Title length" value={`${s.titleLen} chars`} />
                <ScoreCard icon={ImageIcon} label="Images missing alt" value={`${s.imgsMissingAlt} / ${s.imgs}`} />
              </div>

              <div className="glass rounded-2xl p-5">
                <p className="text-sm font-medium mb-3">Page meta detected</p>
                <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Meta label="Title" v={s.title} />
                  <Meta label="Meta description" v={s.metaDesc} />
                  <Meta label="Canonical" v={s.canonical} />
                  <Meta label="Viewport" v={s.viewport} />
                  <Meta label="Lang" v={s.lang} />
                  <Meta label="OG title" v={s.ogTitle} />
                  <Meta label="OG image" v={s.ogImage} />
                  <Meta label="JSON-LD" v={s.hasJsonLd ? "Detected" : null} />
                </dl>
              </div>

              <div className="glass rounded-2xl p-5">
                <p className="text-sm font-medium mb-3">Findings ({seoCat?.findings.length ?? 0})</p>
                <ul className="space-y-3">
                  {seoCat?.findings.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      {f.severity === "critical" ? <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        : f.severity === "warning" ? <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        : <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
                      <div>
                        <p className="font-medium">{f.title}</p>
                        <p className="text-xs text-muted-foreground">{f.detail}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{f.impact}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {result.audit.recommendations.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <p className="text-sm font-medium mb-3">Recommendations</p>
                  <ul className="space-y-2 text-sm">
                    {result.audit.recommendations.map((r, i) => (
                      <li key={i} className="flex gap-3">
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md shrink-0 self-start ${r.priority === "high" ? "bg-red-500/15 text-red-300" : r.priority === "medium" ? "bg-amber-500/15 text-amber-300" : "bg-white/5 text-muted-foreground"}`}>{r.priority}</span>
                        <div>
                          <p className="font-medium">{r.title}</p>
                          <p className="text-xs text-muted-foreground">{r.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function ScoreCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-5">
      <Icon className={`w-4 h-4 ${accent ? "text-[var(--brand-violet)]" : "text-[var(--brand-cyan)]"}`} />
      <div className="text-2xl font-semibold mt-3 text-gradient">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function Meta({ label, v }: { label: string; v: string | null | undefined }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`mt-1 break-words ${v ? "text-foreground" : "text-red-400"}`}>{v || "— missing"}</dd>
    </div>
  );
}