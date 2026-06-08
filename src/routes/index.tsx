import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, ShoppingBag, Mail, Search, Target, Megaphone, Layers,
  TrendingUp, Zap, Sparkles, CheckCircle2, Star, BarChart3, Activity,
  Globe, Rocket, Shield, Users, ChevronRight, PlayCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SaleshubsWebTeam — Scale Shopify Brands with CRO, SEO & Marketing Systems" },
      { name: "description", content: "Elite eCommerce growth agency for Shopify brands. Design, conversion optimization, email marketing, SEO, paid ads, funnels and Shopify management." },
      { property: "og:title", content: "SaleshubsWebTeam — Elite Shopify Growth Agency" },
      { property: "og:description", content: "Premium design, CRO, SEO, email and paid ad systems engineered to scale Shopify brands." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <LogoMarquee />
      <Stats />
      <Services />
      <AnalyzerPreview />
      <CaseStudies />
      <Process />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </SiteLayout>
  );
}

/* ---------- HERO ---------- */
const rotatingWords = ["Conversions", "Revenue", "ROAS", "Retention", "Growth"];

function Hero() {
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setWordIdx((i) => (i + 1) % rotatingWords.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden pt-8 pb-24">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-x-0 top-0 h-[800px] pointer-events-none"
           style={{ background: "var(--gradient-hero)" }} />
      {/* floating blobs */}
      <div className="absolute top-32 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
      <div className="absolute top-60 -right-24 w-[28rem] h-[28rem] rounded-full bg-[var(--brand-cyan)]/15 blur-3xl animate-float" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--brand-mint)] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand-mint)]" />
              </span>
              <span className="text-muted-foreground">Now booking Q3 — limited slots</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]"
            >
              Scaling Shopify brands with high‑converting design,{" "}
              <span className="text-gradient-brand">SEO</span> &amp; marketing systems that compound{" "}
              <span className="relative inline-block min-w-[8ch]">
                <motion.span
                  key={rotatingWords[wordIdx]}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="inline-block text-gradient"
                >
                  {rotatingWords[wordIdx]}
                </motion.span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-6 text-lg text-muted-foreground max-w-xl"
            >
              We help eCommerce brands increase conversions, recover lost revenue, and automate growth
              through Shopify optimization, email marketing, SEO, funnels and paid ads.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/free-audit"
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow"
              >
                Get Free Website Audit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/book-call"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass hover:bg-white/10 transition"
              >
                <PlayCircle className="w-4 h-4" />
                Book Strategy Call
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[var(--brand-mint)] text-[var(--brand-mint)]" />
                ))}
                <span className="ml-1">4.9 / 5 from 280+ brands</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Shopify Plus Partner
              </div>
            </motion.div>
          </div>

          {/* Hero dashboard mockup */}
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}

function HeroDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* glow */}
      <div className="absolute -inset-8 bg-gradient-brand opacity-30 blur-3xl rounded-full" />

      {/* main card */}
      <div className="relative glass-strong rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs text-muted-foreground">growth.dashboard</span>
          <Activity className="w-4 h-4 text-[var(--brand-mint)]" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <KPI label="Revenue" value="$842K" delta="+38%" />
          <KPI label="CVR" value="4.82%" delta="+1.7pp" color="cyan" />
          <KPI label="ROAS" value="6.4x" delta="+220%" color="mint" />
        </div>

        <div className="rounded-xl bg-black/30 p-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">Conversions, last 30d</span>
            <span className="text-xs text-[var(--brand-mint)]">▲ trending</span>
          </div>
          <MiniChart />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center justify-between">
              <Mail className="w-4 h-4 text-[var(--brand-cyan)]" />
              <span className="text-[10px] text-muted-foreground">FLOW</span>
            </div>
            <p className="text-sm font-medium mt-2">Abandoned cart</p>
            <p className="text-xs text-muted-foreground">+$48,210 recovered</p>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="flex items-center justify-between">
              <Target className="w-4 h-4 text-[var(--brand-mint)]" />
              <span className="text-[10px] text-muted-foreground">ADS</span>
            </div>
            <p className="text-sm font-medium mt-2">Meta campaign</p>
            <p className="text-xs text-muted-foreground">CPA $14.20 · 7.1x ROAS</p>
          </div>
        </div>
      </div>

      {/* floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute -right-4 -bottom-6 glass-strong rounded-xl p-3 w-56 hidden sm:block animate-float"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium">New Shopify order</p>
            <p className="text-[11px] text-muted-foreground">$184.00 · 2s ago</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute -left-6 top-10 glass-strong rounded-xl p-3 w-48 hidden md:block animate-float-slow"
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-[var(--brand-mint)]" />
          <p className="text-xs font-medium">SEO traffic</p>
        </div>
        <p className="text-lg font-semibold text-gradient">+218%</p>
        <p className="text-[10px] text-muted-foreground">vs last quarter</p>
      </motion.div>
    </motion.div>
  );
}

function KPI({ label, value, delta, color = "violet" }: { label: string; value: string; delta: string; color?: "violet" | "cyan" | "mint" }) {
  const colorMap = {
    violet: "text-primary",
    cyan: "text-[var(--brand-cyan)]",
    mint: "text-[var(--brand-mint)]",
  };
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
      <p className={`text-[11px] mt-0.5 ${colorMap[color]}`}>{delta}</p>
    </div>
  );
}

function MiniChart() {
  const points = [12, 18, 14, 22, 28, 24, 34, 30, 42, 38, 52, 60, 56, 72];
  const max = Math.max(...points);
  const w = 280;
  const h = 80;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`)
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7B61FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7B61FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7B61FF" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#g1)" />
      <path d={path} fill="none" stroke="url(#g2)" strokeWidth="2" />
    </svg>
  );
}

/* ---------- LOGO MARQUEE ---------- */
function LogoMarquee() {
  const brands = ["LUMEN.", "AURORA", "VERTEX", "NORDIC&CO", "PALETTE", "ATLAS", "MERIDIAN", "HALO", "PRISM", "EMBER"];
  return (
    <section className="py-12 border-y border-white/5 overflow-hidden">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
        Trusted by 280+ Shopify brands worldwide
      </p>
      <div className="relative">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...brands, ...brands].map((b, i) => (
            <span key={i} className="text-2xl font-semibold text-muted-foreground/60 tracking-widest shrink-0">
              {b}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg-deep)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg-deep)] to-transparent" />
      </div>
    </section>
  );
}

/* ---------- STATS ---------- */
function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 30, stiffness: 80 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

function Stats() {
  const stats = [
    { value: 280, suffix: "+", label: "Shopify brands scaled" },
    { value: 412, suffix: "%", label: "Avg. revenue lift" },
    { value: 6, suffix: "x", label: "Avg. ROAS delivered" },
    { value: 48, prefix: "$", suffix: "M+", label: "Revenue generated" },
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="glass rounded-2xl p-6 text-center hover:bg-white/[0.07] transition"
          >
            <div className="text-3xl md:text-4xl font-semibold text-gradient">
              <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- SERVICES ---------- */
const services = [
  { icon: ShoppingBag, title: "Shopify Design & Redesign", desc: "Custom Shopify Plus builds engineered for speed, mobile and conversion.", color: "from-[#7B61FF] to-[#8B5CF6]" },
  { icon: Mail, title: "Email Marketing", desc: "Klaviyo, GetResponse, ConvertKit flows that recover carts and grow LTV.", color: "from-[#00D4FF] to-[#06B6D4]" },
  { icon: Search, title: "SEO", desc: "Technical, on‑page and off‑page SEO tuned for Shopify storefronts.", color: "from-[#14F195] to-[#22C55E]" },
  { icon: Target, title: "Paid Ads", desc: "Meta, Google, TikTok & Snap creative + media buying for profitable ROAS.", color: "from-[#7B61FF] to-[#00D4FF]" },
  { icon: Layers, title: "Funnel Design", desc: "GoHighLevel, Systeme.io and ConvertKit funnels that print revenue.", color: "from-[#8B5CF6] to-[#14F195]" },
  { icon: Megaphone, title: "Social Media", desc: "Instagram, TikTok, Pinterest content, growth and brand management.", color: "from-[#00D4FF] to-[#14F195]" },
  { icon: Globe, title: "Shopify Management", desc: "Products, inventory, apps, performance and full‑service store ops.", color: "from-[#7B61FF] to-[#22C55E]" },
  { icon: Rocket, title: "Commerce Shop Setup", desc: "Facebook, Instagram, TikTok and Pinterest shops wired end‑to‑end.", color: "from-[#06B6D4] to-[#7B61FF]" },
];

function Services() {
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="What we do"
          title={<>One growth partner. <span className="text-gradient">Every channel.</span></>}
          subtitle="A complete eCommerce growth stack — design, CRO, retention, acquisition and operations under one roof."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
              className="group relative glass rounded-2xl p-6 hover:bg-white/[0.07] transition overflow-hidden"
            >
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-2xl group-hover:opacity-40 transition`} />
              <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <div className="mt-4 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition">
                Learn more <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- ANALYZER PREVIEW ---------- */
function AnalyzerPreview() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setScore(null);
    setTimeout(() => {
      setScore(Math.floor(60 + Math.random() * 35));
      setLoading(false);
    }, 1500);
  };

  return (
    <section className="py-24 relative">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[500px] bg-gradient-to-r from-primary/10 via-[var(--brand-cyan)]/10 to-[var(--brand-mint)]/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="AI Website Analyzer"
          title={<>Audit your Shopify store in <span className="text-gradient-brand">60 seconds</span></>}
          subtitle="Speed, SEO, mobile, broken links and conversion — graded by our AI engine with prioritized fixes."
        />

        <div className="mt-12 glass-strong rounded-3xl p-6 md:p-10 max-w-4xl mx-auto">
          <form onSubmit={run} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center glass rounded-xl px-4">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourstore.com"
                className="bg-transparent outline-none px-3 py-3 w-full text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Analyzing…" : <>Analyze <Zap className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="grid md:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Performance", value: score },
              { label: "SEO", value: score ? Math.min(100, score + 5) : null },
              { label: "Mobile UX", value: score ? Math.max(40, score - 3) : null },
              { label: "Conversion", value: score ? Math.max(40, score - 8) : null },
            ].map((m, i) => (
              <ScoreRing key={i} label={m.label} value={m.value} loading={loading} />
            ))}
          </div>

          {score && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 glass rounded-2xl p-5"
            >
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--brand-mint)]" /> AI Recommendations
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0" /> Compress hero imagery — est. 1.4s LCP improvement.</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0" /> Add product schema to 47 PDPs missing markup.</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0" /> Sticky add‑to‑cart on mobile — projected +18% CVR.</li>
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function ScoreRing({ label, value, loading }: { label: string; value: number | null; loading: boolean }) {
  const v = value ?? 0;
  const color = v >= 80 ? "#14F195" : v >= 60 ? "#00D4FF" : "#7B61FF";
  const C = 2 * Math.PI * 36;
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-3">
      <div className="relative w-20 h-20 shrink-0">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r="36" fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: value ? C - (v / 100) * C : C }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
          {loading ? "…" : value ?? "—"}
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ? (v >= 80 ? "Excellent" : v >= 60 ? "Needs work" : "Critical") : "Awaiting"}</p>
      </div>
    </div>
  );
}

/* ---------- CASE STUDIES ---------- */
function CaseStudies() {
  const cases = [
    { brand: "Aurora Skincare", metric: "+320%", label: "Conversion rate", desc: "Shopify Plus redesign + Klaviyo flows in 8 weeks.", tag: "Shopify · Email", color: "from-[#7B61FF] to-[#00D4FF]" },
    { brand: "Vertex Athletics", metric: "+780%", label: "Email revenue", desc: "Built a full lifecycle program from cold list to VIP.", tag: "Email · Retention", color: "from-[#00D4FF] to-[#14F195]" },
    { brand: "Nordic & Co.", metric: "6.4x", label: "Blended ROAS", desc: "Creative + media buying across Meta, Google and TikTok.", tag: "Paid Ads · Creative", color: "from-[#14F195] to-[#7B61FF]" },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Case studies"
          title={<>Results that <span className="text-gradient">compound</span>.</>}
          subtitle="Real Shopify brands. Real transformations. Hundreds of millions in tracked revenue."
        />
        <div className="grid lg:grid-cols-3 gap-5 mt-14">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative glass rounded-3xl p-8 overflow-hidden hover:scale-[1.02] transition-transform duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-[0.08] group-hover:opacity-[0.15] transition`} />
              <div className="relative">
                <span className="text-xs px-2 py-1 rounded-full glass text-muted-foreground">{c.tag}</span>
                <div className="mt-8">
                  <div className="text-5xl font-semibold text-gradient-brand">{c.metric}</div>
                  <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
                </div>
                <div className="h-px w-full bg-white/10 my-6" />
                <h3 className="font-semibold text-lg">{c.brand}</h3>
                <p className="text-sm text-muted-foreground mt-2">{c.desc}</p>
                <Link to="/case-studies" className="mt-6 inline-flex items-center text-sm text-primary group-hover:gap-2 gap-1 transition-all">
                  Read case study <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- PROCESS ---------- */
function Process() {
  const steps = [
    { n: "01", title: "Audit & Strategy", desc: "Deep technical, CRO and growth audit. We map the highest‑leverage moves first.", icon: Search },
    { n: "02", title: "Design & Build", desc: "Shopify Plus design, dev and CRO experiments — engineered for speed and conversion.", icon: Layers },
    { n: "03", title: "Launch & Scale", desc: "Email, paid, SEO and funnels working as one system. Weekly iterations, monthly leaps.", icon: Rocket },
  ];
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="How we work" title={<>A system, not a sprint.</>} subtitle="Three phases. One outcome — a Shopify brand built to scale predictably." />
        <div className="grid md:grid-cols-3 gap-4 mt-14 relative">
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground tracking-widest">{s.n}</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mt-6">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- TESTIMONIALS ---------- */
function Testimonials() {
  const t = [
    { name: "Sara Lindqvist", role: "CEO, Aurora Skincare", quote: "They rebuilt our entire growth engine. Revenue 3x in 6 months — and we finally see where every dollar comes from.", rating: 5 },
    { name: "Marcus Chen", role: "Founder, Vertex Athletics", quote: "The Klaviyo program alone added $480k in 90 days. The strategy work is unlike any agency we've used.", rating: 5 },
    { name: "Priya Anand", role: "CMO, Nordic & Co.", quote: "Our ROAS doubled, and the creative team ships faster than our in‑house team. Truly elite.", rating: 5 },
    { name: "Diego Romero", role: "Founder, Halo Goods", quote: "Site speed, CRO, SEO — all up. The dashboards alone are worth it. We feel in control for the first time.", rating: 5 },
  ];
  return (
    <section className="py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Loved by founders" title={<>What operators say.</>} />
      </div>
      <div className="mt-14 relative">
        <div className="flex gap-5 animate-marquee">
          {[...t, ...t].map((q, i) => (
            <div key={i} className="glass rounded-2xl p-6 w-[360px] shrink-0">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: q.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[var(--brand-mint)] text-[var(--brand-mint)]" />
                ))}
              </div>
              <p className="text-sm leading-relaxed">"{q.quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">
                  {q.name.split(" ").map((w) => w[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{q.name}</p>
                  <p className="text-xs text-muted-foreground">{q.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg-deep)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg-deep)] to-transparent" />
      </div>
    </section>
  );
}

/* ---------- PRICING ---------- */
function Pricing() {
  const plans = [
    { name: "Launch", price: "$2,950", desc: "For brands < $50k/mo MRR ready to install the fundamentals.", features: ["Shopify CRO audit", "Email flow setup", "Basic SEO", "Monthly reporting"], cta: "Get started" },
    { name: "Scale", price: "$6,500", desc: "Full‑stack growth for brands scaling past $1M/yr.", features: ["Shopify redesign", "Klaviyo full program", "Technical SEO", "Paid ads (1 channel)", "Bi‑weekly strategy"], cta: "Most popular", highlight: true },
    { name: "Plus", price: "Custom", desc: "Embedded growth team for Shopify Plus brands.", features: ["Dedicated team", "Multi‑channel paid", "Lifecycle program", "Conversion lab", "Weekly executive sync"], cta: "Talk to sales" },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Pricing" title={<>Engagements built around <span className="text-gradient">outcomes</span>.</>} subtitle="Transparent retainers. No long contracts. Scale or pause whenever." />
        <div className="grid md:grid-cols-3 gap-5 mt-14">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-3xl p-8 ${p.highlight ? "glass-strong ring-1 ring-primary/40" : "glass"}`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-brand text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-semibold">{p.price}</span>
                {p.price !== "Custom" && <span className="text-sm text-muted-foreground mb-1">/mo</span>}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f, j) => (
                  <li key={j} className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/book-call"
                className={`mt-8 inline-flex items-center justify-center w-full px-4 py-3 rounded-xl font-medium transition ${
                  p.highlight
                    ? "bg-gradient-brand text-white"
                    : "glass hover:bg-white/10"
                }`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FAQ() {
  const faqs = [
    { q: "How quickly do you start delivering results?", a: "Most clients see measurable lifts within 30 days — typically through CRO quick wins, abandoned cart flows and paid creative refreshes. Full transformations compound over 90–180 days." },
    { q: "Do you work with non‑Shopify brands?", a: "Shopify and Shopify Plus are our specialty. We occasionally take on WooCommerce or custom builds when the fit is right." },
    { q: "What's the engagement length?", a: "Month‑to‑month after a 60 day initial commitment. We earn the renewal every cycle." },
    { q: "Do you offer one‑off projects?", a: "Yes — Shopify redesigns, email program builds and full audits are available as fixed‑scope sprints." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeader eyebrow="FAQ" title={<>Questions, answered.</>} />
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium">{f.q}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${open === i ? "rotate-90 text-primary" : ""}`} />
              </button>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-5 pb-5 text-sm text-muted-foreground"
                >
                  {f.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */
function FinalCTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-10 md:p-16 text-center">
          <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-aurora)" }} />
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Ready to scale your <span className="text-gradient">Shopify store</span>?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Book a free 30‑minute strategy session. We'll map the three highest‑leverage growth moves for your brand.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/book-call" className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow inline-flex items-center gap-2">
                Book strategy call <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/free-audit" className="px-6 py-3 rounded-xl glass hover:bg-white/10 transition">
                Get free audit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- shared ---------- */
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground">
        <Sparkles className="w-3 h-3 text-[var(--brand-mint)]" />
        {eyebrow}
      </div>
      <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
