import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Globe, Zap, CheckCircle2, Sparkles, AlertTriangle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

export const Route = createFileRoute("/website-analyzer")({
  head: () => ({
    meta: [
      { title: "AI Website Analyzer — Free Shopify Audit | NovaCommerce" },
      { name: "description", content: "Audit your Shopify store: speed, SEO, mobile UX, broken links, and conversion — graded by our AI engine." },
    ],
  }),
  component: AnalyzerPage,
});

function AnalyzerPage() {
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setRunning(true);
    setDone(false);
    setTimeout(() => { setRunning(false); setDone(true); }, 1800);
  };

  const scores = done ? { perf: 78, seo: 84, mobile: 71, cvr: 63 } : { perf: 0, seo: 0, mobile: 0, cvr: 0 };

  return (
    <SiteLayout>
      <PageHero eyebrow="AI Website Analyzer" title={<>Audit your Shopify store in <span className="text-gradient-brand">60 seconds</span>.</>} subtitle="Performance, SEO, mobile UX and conversion — graded by AI with prioritized fixes." />
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="glass-strong rounded-3xl p-6 md:p-10">
            <form onSubmit={run} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center glass rounded-xl px-4">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourstore.com" className="bg-transparent outline-none px-3 py-3 w-full text-sm" />
              </div>
              <button disabled={running} className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60">
                {running ? "Analyzing…" : <>Run audit <Zap className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <Ring label="Performance" value={scores.perf} running={running} />
              <Ring label="SEO" value={scores.seo} running={running} />
              <Ring label="Mobile UX" value={scores.mobile} running={running} />
              <Ring label="Conversion" value={scores.cvr} running={running} />
            </div>

            {done && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--brand-mint)]" /> AI Recommendations</p>
                  <ul className="space-y-2.5 text-sm">
                    {["Compress hero imagery to WebP (LCP -1.4s)", "Add product schema to 47 PDPs", "Sticky add-to-cart on mobile (+18% CVR projected)", "Defer 3rd-party scripts (-2.1s TBT)"].map((r, i) => (
                      <li key={i} className="flex gap-2 text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0" /> {r}</li>
                    ))}
                  </ul>
                </div>
                <div className="glass rounded-2xl p-5">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /> Issues found</p>
                  <ul className="space-y-2.5 text-sm">
                    <li className="flex gap-2 text-muted-foreground"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> 6 broken internal links</li>
                    <li className="flex gap-2 text-muted-foreground"><AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" /> Missing alt text on 38 images</li>
                    <li className="flex gap-2 text-muted-foreground"><AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" /> Checkout funnel: 3 unnecessary steps</li>
                    <li className="flex gap-2 text-muted-foreground"><AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" /> No abandoned cart email flow detected</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Ring({ label, value, running }: { label: string; value: number; running: boolean }) {
  const color = value === 0 ? "#475569" : value >= 80 ? "#14F195" : value >= 60 ? "#00D4FF" : "#7B61FF";
  const C = 2 * Math.PI * 36;
  return (
    <div className="glass rounded-2xl p-5 flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <motion.circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C - (value / 100) * C }} transition={{ duration: 1, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">{running ? "…" : value || "—"}</div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{label}</p>
    </div>
  );
}