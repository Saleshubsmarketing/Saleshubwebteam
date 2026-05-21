import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Users, Award, Globe2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — NovaCommerce eCommerce Growth Agency" },
      { name: "description", content: "We are a global team of Shopify experts, designers and growth operators helping eCommerce brands scale predictably." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="About us" title={<>Built by operators. <span className="text-gradient">For operators.</span></>} subtitle="NovaCommerce is a remote, senior team of Shopify Plus designers, CRO strategists, email architects, paid ads buyers and SEO engineers." />
      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-4 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Users, k: "42", v: "Senior specialists" },
            { icon: Globe2, k: "14", v: "Countries served" },
            { icon: Award, k: "Plus", v: "Shopify Partner" },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-center">
              <s.icon className="w-5 h-5 mx-auto text-[var(--brand-cyan)]" />
              <div className="text-3xl font-semibold mt-3 text-gradient">{s.k}</div>
              <p className="text-sm text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-3xl px-4 mt-16">
          <div className="glass rounded-3xl p-8 space-y-5 text-muted-foreground">
            <p className="text-foreground text-lg">We don't believe in retainers for the sake of retainers.</p>
            <p>We were founded by ex-in-house growth leads who got tired of agencies that delivered decks instead of results. Every engagement starts with a 30-day high-leverage sprint — the moves that move the number.</p>
            <p>From there, we build the system: CRO, lifecycle, paid and SEO, working as one machine. We share weekly dashboards. We earn the renewal every cycle.</p>
            <p className="flex items-center gap-2 text-foreground"><Sparkles className="w-4 h-4 text-[var(--brand-mint)]" /> Quietly obsessed with conversion.</p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}