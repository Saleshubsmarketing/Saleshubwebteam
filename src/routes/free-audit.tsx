import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/free-audit")({
  head: () => ({
    meta: [
      { title: "Free Shopify Audit | NovaCommerce" },
      { name: "description", content: "Get a free, hand-built Shopify audit covering design, CRO, SEO and email — delivered in 72 hours." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <PageHero eyebrow="Free audit" title={<>A <span className="text-gradient-brand">hand-built</span> Shopify audit. On us.</>} subtitle="Delivered in 72 hours by a senior strategist. No bots. No templates." />
      <section className="pb-24 mx-auto max-w-5xl px-4 grid md:grid-cols-2 gap-5">
        <div className="glass rounded-3xl p-8 space-y-4">
          <Sparkles className="w-6 h-6 text-[var(--brand-mint)]" />
          <h3 className="text-xl font-semibold">What you'll receive</h3>
          {[
            "10–15 page custom audit PDF",
            "Conversion rate diagnosis",
            "Top 10 prioritized fixes",
            "Email & SEO opportunities",
            "Projected revenue impact",
          ].map((p, i) => (
            <div key={i} className="flex gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0" />
              <span>{p}</span>
            </div>
          ))}
        </div>
        <div className="glass-strong rounded-3xl p-8">
          {sent ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-10 h-10 text-[var(--brand-mint)] mx-auto" />
              <h3 className="mt-4 text-xl font-semibold">You're in</h3>
              <p className="text-sm text-muted-foreground mt-2">Audit lands in your inbox within 72 hours.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
              <input required placeholder="Name" className="w-full glass rounded-xl px-4 py-3 outline-none text-sm" />
              <input required type="email" placeholder="Email" className="w-full glass rounded-xl px-4 py-3 outline-none text-sm" />
              <input required placeholder="Shopify store URL" className="w-full glass rounded-xl px-4 py-3 outline-none text-sm" />
              <textarea rows={3} placeholder="Anything specific you want us to look at?" className="w-full glass rounded-xl px-4 py-3 outline-none text-sm" />
              <button className="w-full px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow">Request free audit</button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}