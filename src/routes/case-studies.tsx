import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { ArrowRight, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/case-studies")({
  head: () => ({
    meta: [
      { title: "Case Studies — Shopify Growth Wins | SaleshubsWebTeam" },
      { name: "description", content: "Real Shopify brands. Real transformations. Conversion lifts, ROAS gains and email revenue growth." },
    ],
  }),
  component: CasesPage,
});

const cases = [
  { brand: "Aurora Skincare", category: "Shopify + Email", metrics: [["+320%", "Conversion rate"], ["+780%", "Email revenue"], ["$1.4M", "Added in 90 days"]] as const, summary: "Full Shopify Plus redesign + Klaviyo lifecycle program rebuilt from zero.", color: "from-[#7B61FF] to-[#00D4FF]" },
  { brand: "Vertex Athletics", category: "Paid Ads + CRO", metrics: [["6.4x", "Blended ROAS"], ["+1.2M", "Impressions / mo"], ["-42%", "CPA"]] as const, summary: "Creative engine + media buying across Meta, Google and TikTok.", color: "from-[#00D4FF] to-[#14F195]" },
  { brand: "Nordic & Co.", category: "SEO + Content", metrics: [["+218%", "Organic traffic"], ["1,840", "Keywords ranking"], ["+540%", "Organic revenue"]] as const, summary: "Technical SEO overhaul, programmatic content and PR backlinks.", color: "from-[#14F195] to-[#7B61FF]" },
  { brand: "Halo Goods", category: "Funnels + Retention", metrics: [["+412%", "AOV uplift"], ["3.2x", "Subscription growth"], ["+$48k", "Cart recovery / mo"]] as const, summary: "Upsell + subscription funnel, ConvertKit lifecycle and retention playbook.", color: "from-[#8B5CF6] to-[#06B6D4]" },
];

function CasesPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Case studies" title={<>Numbers that <span className="text-gradient-brand">compound</span>.</>} subtitle="A sample of Shopify brands we've scaled with design, CRO, email, paid ads and SEO." />
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 space-y-6">
          {cases.map((c, i) => (
            <div key={i} className="group relative glass rounded-3xl overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-[0.08] group-hover:opacity-[0.15] transition`} />
              <div className="relative grid md:grid-cols-3 gap-8 p-8 md:p-10">
                <div>
                  <span className="text-xs px-2 py-1 rounded-full glass text-muted-foreground">{c.category}</span>
                  <h3 className="font-semibold text-2xl mt-4">{c.brand}</h3>
                  <p className="text-sm text-muted-foreground mt-3">{c.summary}</p>
                  <Link to="/contact" className="mt-6 inline-flex items-center text-sm text-primary gap-1 hover:gap-2 transition-all">
                    Discuss similar results <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  {c.metrics.map(([m, l], j) => (
                    <div key={j} className="glass rounded-2xl p-5 text-center">
                      <TrendingUp className="w-4 h-4 mx-auto text-[var(--brand-mint)]" />
                      <div className="text-3xl md:text-4xl font-semibold text-gradient mt-2">{m}</div>
                      <p className="text-xs text-muted-foreground mt-1">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}