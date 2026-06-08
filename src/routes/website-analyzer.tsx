import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import {
  Globe, Zap, CheckCircle2, Sparkles, AlertTriangle, AlertCircle,
  Download, Loader2, Gauge, Search, Smartphone, MousePointer2, Accessibility,
  Link2, TrendingUp, ArrowRight, RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeWebsite } from "@/lib/analyzer.functions";

type Finding = { severity: "critical" | "warning" | "info"; title: string; detail: string; impact: string };
type Category = { name: string; findings: Finding[] };
type Recommendation = { priority: "high" | "medium" | "low"; title: string; detail: string; effort: "low" | "medium" | "high" };
type Audit = {
  summary: string;
  scores: { performance: number; seo: number; mobile: number; ux: number; conversion: number; accessibility: number };
  categories: Category[];
  recommendations: Recommendation[];
};
type LighthouseSide = {
  scores: { performance: number; accessibility: number; bestPractices: number; seo: number };
  metrics: { fcp: string | null; lcp: string | null; cls: string | null; tbt: string | null; si: string | null; tti: string | null };
};

export const Route = createFileRoute("/website-analyzer")({
  head: () => ({
    meta: [
      { title: "AI Website Analyzer — Free Shopify Audit | SaleshubsWebTeam" },
      { name: "description", content: "Audit your Shopify store: speed, SEO, mobile UX, broken links, and conversion — graded by our AI engine." },
    ],
  }),
  component: AnalyzerPage,
});

type AuditResult = {
  audit: Audit;
  url: string;
  fallback: boolean;
  lighthouse: { mobile: LighthouseSide | null; desktop: any };
};

function AnalyzerPage() {
  const analyze = useServerFn(analyzeWebsite);
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [cwv, setCwv] = useState<LighthouseSide | null>(null);
  const [fallback, setFallback] = useState(false);
  const [progressMsg, setProgressMsg] = useState("Validating URL…");

  useEffect(() => {
    if (!running) return;
    const steps = [
      "Validating URL & SSL certificate…",
      "Probing server response and headers…",
      "Extracting on-page SEO signals…",
      "Running Google Lighthouse (mobile)…",
      "Running Google Lighthouse (desktop)…",
      "Checking robots.txt and sitemap.xml…",
      "Sampling internal links for 404s…",
      "Compiling audit dashboard…",
    ];
    let i = 0;
    setProgressMsg(steps[0]);
    const id = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1);
      setProgressMsg(steps[i]);
    }, 4500);
    return () => clearInterval(id);
  }, [running]);

  const applyResult = (res: AuditResult) => {
    setAudit(res.audit);
    setScannedUrl(res.url);
    setCwv(res.lighthouse?.mobile ?? null);
    setFallback(res.fallback ?? false);
  };

  const run = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;
    setRunning(true);
    setError(null);
    setAudit(null);
    setCwv(null);
    setFallback(false);
    try {
      const res = await analyze({ data: { url } });
      if (res.ok) {
        applyResult(res as unknown as AuditResult);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed.");
    } finally {
      setRunning(false);
    }
  };

  const handleRetry = async () => {
    if (!scannedUrl) return;
    setRunning(true);
    setError(null);
    setAudit(null);
    setCwv(null);
    setFallback(false);
    try {
      const res = await analyze({ data: { url: scannedUrl } });
      if (res.ok) {
        applyResult(res as unknown as AuditResult);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry audit failed.");
    } finally {
      setRunning(false);
    }
  };

  const download = () => {
    if (!audit || !scannedUrl) return;
    const md = buildReport(scannedUrl, audit);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `novacommerce-audit-${new URL(scannedUrl).hostname}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const s = audit?.scores;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="AI Website Analyzer"
        title={<>Audit your store in <span className="text-gradient-brand">60 seconds</span>.</>}
        subtitle="Performance, SEO, mobile, UX, conversion and accessibility — graded by AI with prioritized fixes."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="glass-strong rounded-3xl p-6 md:p-8">
            <form onSubmit={run} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center glass rounded-xl px-4">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourstore.com"
                  className="bg-transparent outline-none px-3 py-3 w-full text-sm"
                />
              </div>
              <button
                disabled={running}
                className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 btn-glow min-w-[170px]"
              >
                {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Auditing…</> : <>Run AI audit <Zap className="w-4 h-4" /></>}
              </button>
            </form>

            {error && (
              <div className="mt-4 glass rounded-xl p-4 text-sm flex gap-2 text-red-300">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
              <ScoreRing label="Performance" icon={Gauge} value={s?.performance ?? 0} running={running} />
              <ScoreRing label="SEO" icon={Search} value={s?.seo ?? 0} running={running} />
              <ScoreRing label="Mobile" icon={Smartphone} value={s?.mobile ?? 0} running={running} />
              <ScoreRing label="UX" icon={MousePointer2} value={s?.ux ?? 0} running={running} />
              <ScoreRing label="Conversion" icon={TrendingUp} value={s?.conversion ?? 0} running={running} />
              <ScoreRing label="Accessibility" icon={Accessibility} value={s?.accessibility ?? 0} running={running} />
            </div>

            <AnimatePresence>
              {running && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="mt-6 glass rounded-2xl p-5 text-sm text-muted-foreground flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-cyan)]" />
                  {progressMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {audit && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
                {fallback && (
                  <div className="glass rounded-2xl p-4 text-sm flex items-start gap-3 border-yellow-500/20 bg-yellow-500/5">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-200">Google Lighthouse temporarily unavailable</p>
                      <p className="text-muted-foreground mt-0.5">
                        Results are based on live crawl and header analysis only. Retry in a minute to get full Lighthouse Core Web Vitals.
                      </p>
                    </div>
                    <button
                      onClick={handleRetry}
                      disabled={running}
                      className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-200 text-xs font-medium disabled:opacity-50"
                    >
                      {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      {running ? "Retrying…" : "Retry"}
                    </button>
                  </div>
                )}

                {cwv && (
                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-[var(--brand-cyan)]" /> Core Web Vitals (Google Lighthouse · Mobile)
                      </p>
                      <button
                        onClick={handleRetry}
                        disabled={running}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass-strong hover:bg-white/10 text-xs font-medium disabled:opacity-50"
                      >
                        {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        {running ? "Retrying…" : "Retry live audit"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { k: "LCP", v: cwv.metrics.lcp },
                        { k: "FCP", v: cwv.metrics.fcp },
                        { k: "CLS", v: cwv.metrics.cls },
                        { k: "TBT", v: cwv.metrics.tbt },
                        { k: "Speed Index", v: cwv.metrics.si },
                        { k: "TTI", v: cwv.metrics.tti },
                      ].map((m) => (
                        <div key={m.k} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.k}</p>
                          <p className="text-sm font-semibold mt-1">{m.v ?? "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="glass rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div className="flex gap-3">
                    <Sparkles className="w-5 h-5 text-[var(--brand-mint)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Executive summary · {scannedUrl}</p>
                      <p className="text-sm">{audit.summary}</p>
                    </div>
                  </div>
                  <button
                    onClick={download}
                    className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-strong hover:bg-white/10 text-sm shrink-0"
                  >
                    <Download className="w-4 h-4" /> Download report
                  </button>
                </div>

                {/* Top recommendations */}
                <div className="glass rounded-2xl p-5">
                  <p className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--brand-mint)]" /> Prioritized fixes
                  </p>
                  <div className="space-y-3">
                    {audit.recommendations.map((r, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex flex-col items-center min-w-[44px]">
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${priorityClass(r.priority)}`}>
                            {r.priority}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-1">{r.effort} effort</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{r.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{r.detail}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground self-center" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="grid md:grid-cols-2 gap-4">
                  {audit.categories.map((c) => (
                    <div key={c.name} className="glass rounded-2xl p-5">
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        {categoryIcon(c.name)} {c.name}
                      </p>
                      <ul className="space-y-3 text-sm">
                        {c.findings.map((f, i) => (
                          <li key={i} className="flex gap-2">
                            {severityIcon(f.severity)}
                            <div className="flex-1">
                              <p className="font-medium">{f.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{f.detail}</p>
                              <p className="text-xs text-[var(--brand-mint)] mt-1">→ {f.impact}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="glass-strong rounded-2xl p-6 text-center">
                  <p className="text-sm text-muted-foreground">Want a senior strategist to walk you through every fix?</p>
                  <a href="/book-call" className="inline-flex mt-3 px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-medium btn-glow">
                    Book a free strategy call
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function ScoreRing({ label, value, running, icon: Icon }: { label: string; value: number; running: boolean; icon: any }) {
  const color = value === 0 ? "#475569" : value >= 80 ? "#14F195" : value >= 60 ? "#00D4FF" : value >= 40 ? "#7B61FF" : "#EF4444";
  const C = 2 * Math.PI * 36;
  return (
    <div className="glass rounded-2xl p-4 flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C - (value / 100) * C }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-base font-semibold">
          {running ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : value || "—"}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function priorityClass(p: string) {
  if (p === "high") return "bg-red-500/15 text-red-300 border border-red-500/30";
  if (p === "medium") return "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30";
  return "bg-white/5 text-muted-foreground border border-white/10";
}

function severityIcon(s: Finding["severity"]) {
  if (s === "critical") return <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />;
  if (s === "warning") return <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />;
  return <CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0" />;
}

function categoryIcon(name: string) {
  const map: Record<string, any> = {
    Performance: Gauge, SEO: Search, Mobile: Smartphone, UX: MousePointer2,
    Conversion: TrendingUp, Accessibility: Accessibility, "Broken Links": Link2,
  };
  const Icon = map[name] || Sparkles;
  return <Icon className="w-4 h-4 text-[var(--brand-cyan)]" />;
}

function buildReport(url: string, a: Audit) {
  const lines: string[] = [];
  lines.push(`# SaleshubsWebTeam — Website Audit`);
  lines.push(``, `**URL:** ${url}`, `**Date:** ${new Date().toLocaleDateString()}`, ``);
  lines.push(`## Executive summary`, ``, a.summary, ``);
  lines.push(`## Scores`, ``);
  Object.entries(a.scores).forEach(([k, v]) => lines.push(`- **${k}**: ${v}/100`));
  lines.push(``, `## Prioritized fixes`, ``);
  a.recommendations.forEach((r, i) => {
    lines.push(`### ${i + 1}. ${r.title}  _(${r.priority} priority · ${r.effort} effort)_`);
    lines.push(r.detail, ``);
  });
  lines.push(`## Findings by category`, ``);
  a.categories.forEach((c) => {
    lines.push(`### ${c.name}`, ``);
    c.findings.forEach((f) => {
      lines.push(`- **[${f.severity.toUpperCase()}] ${f.title}** — ${f.detail}`);
      lines.push(`  - Impact: ${f.impact}`);
    });
    lines.push(``);
  });
  lines.push(`---`, ``, `Generated by SaleshubsWebTeam · novacommerce.agency`);
  return lines.join("\n");
}