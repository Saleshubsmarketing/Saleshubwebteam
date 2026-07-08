import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import {
  Gauge, Search, BarChart3, Swords, ShoppingBag, MousePointerClick,
  DollarSign, TrendingUp, Sparkles, Activity,
} from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({ meta: [
    { title: "Free Growth Tools | SaleshubsWebOffice" },
    { name: "description", content: "Real-time eCommerce growth tools: SEO, traffic, competitor, Shopify and revenue analyzers." },
  ]}),
  component: ToolsHub,
});

const tools = [
  { to: "/website-analyzer", icon: Gauge, title: "Website Analyzer", desc: "Lighthouse performance, SEO, accessibility & Core Web Vitals." },
  { to: "/seo-analyzer", icon: Search, title: "SEO Analyzer", desc: "On-page SEO audit with prioritized fix list." },
  { to: "/traffic-checker", icon: BarChart3, title: "Traffic Checker", desc: "Live Semrush traffic, keywords and backlinks." },
  { to: "/competitor-analyzer", icon: Swords, title: "Competitor Analyzer", desc: "Head-to-head domain comparison." },
  { to: "/shopify-grader", icon: ShoppingBag, title: "Shopify Store Grader", desc: "Score your store's speed, UX and trust signals." },
  { to: "/conversion-analyzer", icon: MousePointerClick, title: "Conversion Analyzer", desc: "Audit CTAs, trust signals and checkout UX." },
  { to: "/revenue-calculator", icon: DollarSign, title: "Revenue Calculator", desc: "Forecast revenue lift from CR optimization." },
  { to: "/roi-calculator", icon: TrendingUp, title: "ROI Calculator", desc: "SEO, email, paid ads and funnel ROI." },
  { to: "/ai-growth-advisor", icon: Sparkles, title: "AI Growth Advisor", desc: "AI strategy across SEO, funnel, email and ads." },
  { to: "/marketing-health-score", icon: Activity, title: "Marketing Health Score", desc: "Composite growth score with radar." },
] as const;

function ToolsHub() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Growth Toolkit"
        title={<>Real-time tools for <span className="text-gradient-brand">eCommerce growth</span>.</>}
        subtitle="Every tool here uses live APIs — no fake data, no estimates."
      />
      <section className="pb-24 mx-auto max-w-7xl px-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="glass rounded-2xl p-6 hover:bg-white/5 transition group">
            <t.icon className="w-6 h-6 text-[var(--brand-mint)] group-hover:scale-110 transition" />
            <h3 className="mt-4 font-semibold text-lg">{t.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
          </Link>
        ))}
      </section>
    </SiteLayout>
  );
}