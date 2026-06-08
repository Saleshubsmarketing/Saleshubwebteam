import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Transparent Shopify Growth Plans | SaleshubsWebTeam" },
      { name: "description", content: "Three engagement levels: Launch, Scale and Plus. Month-to-month after a 60 day initial commitment." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  { name: "Launch", price: "$2,950", desc: "For brands < $50k/mo MRR ready to install the fundamentals.", features: ["Shopify CRO audit", "Email flow setup", "Basic SEO", "Monthly reporting"], cta: "Get started", highlight: false },
  { name: "Scale", price: "$6,500", desc: "Full-stack growth for brands scaling past $1M/yr.", features: ["Shopify redesign", "Klaviyo full program", "Technical SEO", "Paid ads (1 channel)", "Bi-weekly strategy"], cta: "Most popular", highlight: true },
  { name: "Plus", price: "Custom", desc: "Embedded growth team for Shopify Plus brands.", features: ["Dedicated team", "Multi-channel paid", "Lifecycle program", "Conversion lab", "Weekly executive sync"], cta: "Talk to sales", highlight: false },
];

function PricingPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Pricing" title={<>Engagements built around <span className="text-gradient">outcomes</span>.</>} subtitle="Transparent retainers. No long contracts. Scale or pause whenever." />
      <section className="pb-24 mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p, i) => (
            <div key={i} className={`relative rounded-3xl p-8 ${p.highlight ? "glass-strong ring-1 ring-primary/40" : "glass"}`}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-brand text-white">Most popular</span>
              )}
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-semibold">{p.price}</span>
                {p.price !== "Custom" && <span className="text-sm text-muted-foreground mb-1">/mo</span>}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f, j) => (
                  <li key={j} className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0" /> {f}</li>
                ))}
              </ul>
              <Link to="/book-call" className={`mt-8 inline-flex items-center justify-center w-full px-4 py-3 rounded-xl font-medium transition ${p.highlight ? "bg-gradient-brand text-white" : "glass hover:bg-white/10"}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}