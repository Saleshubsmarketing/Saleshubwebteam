import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import {
  Users, Globe, Search, Link as LinkIcon,
  Sparkles, Loader2, Gauge, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useServerFn } from "@tanstack/react-start";
import { semrushDomainSnapshot } from "@/lib/semrush.functions";

export const Route = createFileRoute("/traffic-checker")({
  head: () => ({
    meta: [
      { title: "Traffic Checker — Real-Time Domain Data | SaleshubsWebOffice" },
      { name: "description", content: "Live Semrush data: organic traffic, keywords, backlinks and authority for any domain." },
    ],
  }),
  component: TrafficPage,
});

type Snapshot = Extract<Awaited<ReturnType<typeof semrushDomainSnapshot>>, { ok: true }>;

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(n));
}
function cleanDomain(input: string) {
  return input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

function TrafficPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchSnapshot = useServerFn(semrushDomainSnapshot);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const d = cleanDomain(input);
    if (!d || !d.includes(".")) {
      setError("Enter a valid domain (e.g. allbirds.com).");
      return;
    }
    setLoading(true);
    setReport(null);
    setError(null);
    try {
      const snap = await fetchSnapshot({ data: { domain: d, database: "us" } });
      if (snap.ok) setReport(snap);
      else setError(snap.error);
    } catch (err: any) {
      setError(err?.message ?? "Live data unavailable. Try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Traffic Checker"
        title={<>Look inside any <span className="text-gradient-brand">domain</span>.</>}
        subtitle="Real-time Semrush data: organic traffic, keywords, backlinks and authority — no estimates."
      />

      <section className="pb-24 mx-auto max-w-7xl px-4">
        <form
          onSubmit={submit}
          className="glass-strong rounded-3xl p-4 md:p-6 flex flex-col sm:flex-row gap-3 items-stretch"
        >
          <div className="flex-1 flex items-center gap-3 glass rounded-xl px-4">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. allbirds.com"
              className="flex-1 bg-transparent outline-none text-sm py-3"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Analyzing…" : "Check traffic"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-[var(--brand-cyan)]" />
          100% real-time data from Semrush — no estimates or placeholders.
        </p>

        {error && (
          <div className="mt-6 glass rounded-2xl p-4 border border-red-500/30 flex gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="font-medium text-red-300">Live data unavailable</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading && <SkeletonDash key="skel" />}
          {report && !loading && <Dashboard key={report.domain} r={report} />}
          {!report && !loading && !error && <EmptyState key="empty" />}
        </AnimatePresence>
      </section>
    </SiteLayout>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="mt-8 glass rounded-3xl p-10 text-center text-muted-foreground text-sm"
    >
      Try <span className="text-foreground font-medium">allbirds.com</span>,{" "}
      <span className="text-foreground font-medium">gymshark.com</span>, or your own store.
    </motion.div>
  );
}

function SkeletonDash() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 h-28 animate-pulse" />
        ))}
      </div>
      <div className="glass rounded-2xl h-32 animate-pulse" />
    </motion.div>
  );
}

function Dashboard({ r }: { r: Snapshot }) {
  const followPct = r.backlinks > 0 ? Math.round((r.followLinks / r.backlinks) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 space-y-4"
    >
      <div className="glass-strong rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white">
            {r.domain[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{r.domain}</h2>
            <p className="text-xs text-muted-foreground">Live Semrush snapshot · database: {r.database.toUpperCase()}</p>
          </div>
        </div>
        <ScoreRing value={r.authority} label="Authority" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Users} label="Est. monthly organic traffic" value={fmt(r.organicTraffic)} />
        <Kpi icon={Search} label="Organic keywords" value={fmt(r.organicKeywords)} />
        <Kpi icon={LinkIcon} label="Backlinks" value={fmt(r.backlinks)} sub={`${fmt(r.refDomains)} referring domains`} />
        <Kpi icon={Gauge} label="Authority Score" value={`${r.authority}`} sub="Semrush AS" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <p className="text-sm font-medium mb-4">Paid search</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Paid keywords" v={fmt(r.paidKeywords)} />
            <Stat label="Paid traffic" v={fmt(r.paidTraffic)} />
            <Stat label="Organic value" v={`$${fmt(r.organicCost)}/mo`} />
            <Stat label="Semrush rank" v={r.rank ? `#${fmt(r.rank)}` : "—"} />
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-sm font-medium mb-4">Backlink profile</p>
          <div className="space-y-3 text-sm">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Follow links</span>
                <span className="text-muted-foreground">{followPct}% · {fmt(r.followLinks)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${followPct}%` }} transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-brand" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Nofollow links</span>
                <span className="text-muted-foreground">{100 - followPct}% · {fmt(r.nofollowLinks)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-[var(--brand-cyan)]" style={{ width: `${100 - followPct}%` }} />
              </div>
            </div>
            <div className="pt-2 grid grid-cols-2 gap-3">
              <Stat label="Total backlinks" v={fmt(r.backlinks)} />
              <Stat label="Referring domains" v={fmt(r.refDomains)} />
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Data fetched live from Semrush. Numbers reflect Semrush's latest crawl for the {r.database.toUpperCase()} database.
      </p>
    </motion.div>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-base font-semibold mt-0.5">{v}</p>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub }: {
  icon: any; label: string; value: string; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <Icon className="w-4 h-4 text-[var(--brand-mint)]" />
      <div className="text-2xl font-semibold mt-3 text-gradient">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

function ScoreRing({ value, label, color = "#FF6B4A" }: { value: number; label: string; color?: string }) {
  const r = 26, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="flex items-center gap-3 glass rounded-xl px-3 py-2">
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
        <motion.circle
          cx="30" cy="30" r={r} stroke={color} strokeWidth="6" fill="none"
          strokeLinecap="round" transform="rotate(-90 30 30)"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <text x="30" y="34" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">{value}</text>
      </svg>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value >= 60 ? "Strong" : value >= 30 ? "Growing" : "New"}</p>
      </div>
    </div>
  );
}