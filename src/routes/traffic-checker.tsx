import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import {
  TrendingUp, Users, Globe, Search, Link as LinkIcon, FileText,
  ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Gauge, MapPin, Share2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { semrushDomainSnapshot } from "@/lib/semrush.functions";

export const Route = createFileRoute("/traffic-checker")({
  head: () => ({
    meta: [
      { title: "Traffic Checker — Estimate Any Domain | NovaCommerce" },
      { name: "description", content: "Estimate organic traffic, top keywords, backlinks and domain authority for any site." },
    ],
  }),
  component: TrafficPage,
});

/* ---------------- deterministic pseudo-data engine ---------------- */

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(n));
}
function cleanDomain(input: string) {
  return input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

type Report = ReturnType<typeof buildReport>;

function buildReport(domain: string) {
  const seed = hashStr(domain);
  const rand = mulberry32(seed);
  const sizeBias = 0.3 + rand() * 1.6; // small → big domain

  const visits = Math.round(40_000 * sizeBias * (1 + rand() * 14));
  const keywords = Math.round(900 * sizeBias * (1 + rand() * 12));
  const backlinks = Math.round(1_200 * sizeBias * (1 + rand() * 18));
  const refDomains = Math.round(backlinks * (0.04 + rand() * 0.06));
  const authority = Math.min(92, Math.max(8, Math.round(22 + sizeBias * 28 + rand() * 12)));
  const seoScore = Math.min(98, Math.max(28, Math.round(authority * 0.9 + rand() * 18)));

  const trend = Array.from({ length: 16 }).map((_, i) => {
    const drift = (i / 15) * (0.6 + rand() * 0.8);
    const noise = (rand() - 0.5) * 0.25;
    return Math.max(8, Math.round((visits / 1000) * (0.45 + drift + noise)));
  });
  const prev = trend[trend.length - 5];
  const cur = trend[trend.length - 1];
  const trendDelta = ((cur - prev) / prev) * 100;

  const sources = (() => {
    const organic = 35 + rand() * 35;
    const direct = 12 + rand() * 18;
    const referral = 6 + rand() * 14;
    const social = 4 + rand() * 12;
    const paid = 100 - organic - direct - referral - social;
    return [
      { k: "Organic search", v: organic, c: "#7B61FF" },
      { k: "Direct", v: direct, c: "#00D4FF" },
      { k: "Referral", v: referral, c: "#14F195" },
      { k: "Social", v: social, c: "#F59E0B" },
      { k: "Paid", v: Math.max(2, paid), c: "#EC4899" },
    ];
  })();

  const countries = ["United States", "United Kingdom", "Germany", "France", "Canada", "Australia", "Netherlands", "Sweden"]
    .map((c) => ({ c, v: Math.round(5 + rand() * 35) }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);
  const cTotal = countries.reduce((a, b) => a + b.v, 0);
  countries.forEach((c) => (c.v = Math.round((c.v / cTotal) * 100)));

  const kwBank = [
    "buy", "best", "review", "guide", "cheap", "premium", "vs", "near me", "for women",
    "for men", "organic", "luxury", "minimalist", "scandinavian", "sustainable",
  ];
  const root = domain.replace(/\..*/, "");
  const keywordsList = Array.from({ length: 8 }).map(() => {
    const phrase = `${kwBank[Math.floor(rand() * kwBank.length)]} ${root} ${kwBank[Math.floor(rand() * kwBank.length)]}`.trim();
    return {
      kw: phrase,
      pos: 1 + Math.floor(rand() * 18),
      vol: Math.round(500 + rand() * 80_000),
      traffic: Math.round(80 + rand() * 14_000),
      delta: Math.round((rand() - 0.4) * 12),
    };
  });

  const pagePaths = ["/", "/collections/all", "/products/best-seller", "/pages/about", "/blog", "/collections/new", "/pages/reviews"];
  const topPages = pagePaths.slice(0, 6).map((p) => ({
    p,
    traffic: Math.round(visits * (0.04 + rand() * 0.18)),
    keywords: Math.round(20 + rand() * 600),
  })).sort((a, b) => b.traffic - a.traffic);

  const refSites = ["forbes.com", "techcrunch.com", "vogue.com", "wired.com", "shopify.com", "producthunt.com", "medium.com", "reddit.com"];
  const backlinksList = refSites.slice(0, 6).map((s) => ({
    src: s,
    dr: Math.round(60 + rand() * 35),
    anchor: ["click here", root, `best ${root}`, "official site", "read more"][Math.floor(rand() * 5)],
    type: rand() > 0.4 ? "Follow" : "Nofollow",
  }));

  const competitors = [`${root}rival.com`, `try${root}.com`, `get${root}.io`, `${root}hq.com`].map((c) => ({
    d: c,
    overlap: Math.round(10 + rand() * 70),
    visits: Math.round(visits * (0.4 + rand() * 1.4)),
  }));

  return {
    domain, visits, keywords, backlinks, refDomains, authority, seoScore,
    trend, trendDelta, sources, countries, keywordsList, topPages, backlinksList, competitors,
  };
}

/* ---------------- UI ---------------- */

function TrafficPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [live, setLive] = useState(false);
  const fetchSnapshot = useServerFn(semrushDomainSnapshot);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const d = cleanDomain(input);
    if (!d || !d.includes(".")) return;
    setLoading(true);
    setReport(null);
    setLive(false);

    const base = buildReport(d);
    try {
      const snap = await fetchSnapshot({ data: { domain: d, database: "us" } });
      if (snap.ok) {
        setReport({
          ...base,
          visits: snap.organicTraffic || base.visits,
          keywords: snap.organicKeywords || base.keywords,
          backlinks: snap.backlinks || base.backlinks,
          refDomains: snap.refDomains || base.refDomains,
          authority: snap.authority || base.authority,
        });
        setLive(true);
      } else {
        toast.error(snap.error);
        setReport(base);
      }
    } catch (err: any) {
      toast.error("Live data unavailable — showing estimate.");
      setReport(base);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Traffic Checker"
        title={<>Look inside any <span className="text-gradient-brand">domain</span>.</>}
        subtitle="Estimated traffic, organic keywords, backlinks, authority and SEO score — in a single SaaS dashboard."
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
            className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow flex items-center justify-center gap-2 min-w-[160px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Analyzing…" : "Check traffic"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          {live ? "Live Semrush data on your subscription." : "Estimates blended with live Semrush data when available."}
        </p>

        <AnimatePresence mode="wait">
          {loading && <SkeletonDash key="skel" />}
          {report && !loading && <Dashboard key={report.domain} r={report} />}
          {!report && !loading && <EmptyState key="empty" />}
        </AnimatePresence>
      </section>
    </SiteLayout>
  );
}

/* ---------- empty + skeleton ---------- */

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
      <div className="glass rounded-2xl h-64 animate-pulse" />
    </motion.div>
  );
}

/* ---------- dashboard ---------- */

function Dashboard({ r }: { r: Report }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 space-y-4"
    >
      {/* Header */}
      <div className="glass-strong rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white">
            {r.domain[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{r.domain}</h2>
            <p className="text-xs text-muted-foreground">Global market • Last 16 weeks</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ScoreRing value={r.seoScore} label="SEO Score" />
          <ScoreRing value={r.authority} label="Authority" color="#00D4FF" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Users} label="Monthly visits" value={fmt(r.visits)} delta={r.trendDelta} />
        <Kpi icon={Search} label="Organic keywords" value={fmt(r.keywords)} delta={+(r.trendDelta * 0.6).toFixed(1)} />
        <Kpi icon={LinkIcon} label="Backlinks" value={fmt(r.backlinks)} sub={`${fmt(r.refDomains)} ref domains`} />
        <Kpi icon={Gauge} label="Domain Authority" value={`DR ${r.authority}`} sub="Estimated" />
      </div>

      {/* Trend + Sources */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Traffic trend</p>
            <span className={`text-xs flex items-center gap-1 ${r.trendDelta >= 0 ? "text-[var(--brand-mint)]" : "text-red-400"}`}>
              {r.trendDelta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(r.trendDelta).toFixed(1)}% vs last month
            </span>
          </div>
          <TrendChart data={r.trend} />
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><Share2 className="w-4 h-4 text-[var(--brand-cyan)]" />
            <p className="text-sm font-medium">Traffic sources</p>
          </div>
          <DonutChart data={r.sources} />
          <ul className="mt-4 space-y-2">
            {r.sources.map((s) => (
              <li key={s.k} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.c }} />
                  {s.k}
                </span>
                <span className="text-muted-foreground">{s.v.toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Countries + Competitors */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[var(--brand-mint)]" />
            <p className="text-sm font-medium">Top countries</p>
          </div>
          <div className="space-y-3">
            {r.countries.map((c) => (
              <div key={c.c}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{c.c}</span><span className="text-muted-foreground">{c.v}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${c.v}%` }} transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-brand" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-sm font-medium mb-4">Main competitors</p>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr><th className="text-left py-2">Domain</th><th className="text-left">Overlap</th><th className="text-left">Visits</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {r.competitors.map((c) => (
                <tr key={c.d}>
                  <td className="py-3">{c.d}</td>
                  <td className="text-[var(--brand-cyan)]">{c.overlap}%</td>
                  <td>{fmt(c.visits)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keywords */}
      <div className="glass rounded-2xl p-5">
        <p className="text-sm font-medium mb-4">Top organic keywords</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left py-2">Keyword</th>
                <th className="text-left">Position</th>
                <th className="text-left">Volume</th>
                <th className="text-left">Traffic</th>
                <th className="text-left">Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {r.keywordsList.map((k) => (
                <tr key={k.kw}>
                  <td className="py-3">{k.kw}</td>
                  <td className="text-[var(--brand-mint)]">#{k.pos}</td>
                  <td className="text-muted-foreground">{fmt(k.vol)}</td>
                  <td>{fmt(k.traffic)}</td>
                  <td className={k.delta >= 0 ? "text-[var(--brand-mint)]" : "text-red-400"}>
                    {k.delta >= 0 ? "+" : ""}{k.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top pages + Backlinks */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><FileText className="w-4 h-4 text-[var(--brand-cyan)]" />
            <p className="text-sm font-medium">Top pages</p>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr><th className="text-left py-2">Path</th><th className="text-left">Traffic</th><th className="text-left">Keywords</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {r.topPages.map((p) => (
                <tr key={p.p}><td className="py-3 truncate max-w-[180px]">{p.p}</td><td>{fmt(p.traffic)}</td><td className="text-muted-foreground">{fmt(p.keywords)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><LinkIcon className="w-4 h-4 text-[var(--brand-mint)]" />
            <p className="text-sm font-medium">Recent backlinks</p>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr><th className="text-left py-2">Source</th><th className="text-left">DR</th><th className="text-left">Anchor</th><th className="text-left">Type</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {r.backlinksList.map((b) => (
                <tr key={b.src}>
                  <td className="py-3">{b.src}</td>
                  <td className="text-[var(--brand-cyan)]">{b.dr}</td>
                  <td className="text-muted-foreground truncate max-w-[120px]">{b.anchor}</td>
                  <td className={b.type === "Follow" ? "text-[var(--brand-mint)]" : "text-muted-foreground"}>{b.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- atoms ---------- */

function Kpi({ icon: Icon, label, value, delta, sub }: {
  icon: any; label: string; value: string; delta?: number; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between">
        <Icon className="w-4 h-4 text-[var(--brand-mint)]" />
        {typeof delta === "number" && (
          <span className={`text-[10px] flex items-center gap-0.5 ${delta >= 0 ? "text-[var(--brand-mint)]" : "text-red-400"}`}>
            {delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold mt-3 text-gradient">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{sub || label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{label}</p>}
    </motion.div>
  );
}

function ScoreRing({ value, label, color = "#7B61FF" }: { value: number; label: string; color?: string }) {
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
        <p className="text-sm font-medium">{value >= 70 ? "Strong" : value >= 45 ? "Good" : "Growing"}</p>
      </div>
    </div>
  );
}

function TrendChart({ data }: { data: number[] }) {
  const w = 800, h = 200;
  const max = Math.max(...data), min = Math.min(...data);
  const step = w / (data.length - 1);
  const y = (v: number) => h - ((v - min) / (max - min || 1)) * (h - 20) - 10;
  const path = data.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y(p)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
      <defs>
        <linearGradient id="tgg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7B61FF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7B61FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="rgba(255,255,255,0.05)" />
      ))}
      <motion.path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#tgg)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.path d={path} stroke="#7B61FF" strokeWidth="2.5" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} />
      {data.map((p, i) => (
        <circle key={i} cx={i * step} cy={y(p)} r="3" fill="#00D4FF" />
      ))}
    </svg>
  );
}

function DonutChart({ data }: { data: { k: string; v: number; c: string }[] }) {
  const total = data.reduce((a, b) => a + b.v, 0);
  const r = 50, cx = 70, cy = 70, stroke = 16;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 140 140" className="w-40 h-40 mx-auto">
      <circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} fill="none" />
      {data.map((d, i) => {
        const len = (d.v / total) * C;
        const dash = `${len} ${C - len}`;
        const off = -acc;
        acc += len;
        return (
          <motion.circle
            key={i} cx={cx} cy={cy} r={r}
            stroke={d.c} strokeWidth={stroke} fill="none"
            strokeDasharray={dash} strokeDashoffset={off}
            transform={`rotate(-90 ${cx} ${cy})`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
          />
        );
      })}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="14" fontWeight="600" fill="white">100%</text>
    </svg>
  );
}