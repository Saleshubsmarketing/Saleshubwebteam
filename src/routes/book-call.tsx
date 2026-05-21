import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { CheckCircle2, Calendar } from "lucide-react";

export const Route = createFileRoute("/book-call")({
  head: () => ({
    meta: [
      { title: "Book a Strategy Call | NovaCommerce" },
      { name: "description", content: "Book a free 30-minute strategy session with a senior Shopify growth strategist." },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Strategy call" title={<>Book a free <span className="text-gradient-brand">30-min</span> strategy session.</>} subtitle="A senior strategist will map the three highest-leverage growth moves for your Shopify brand." />
      <section className="pb-24 mx-auto max-w-5xl px-4 grid md:grid-cols-5 gap-5">
        <div className="md:col-span-2 glass rounded-3xl p-6 space-y-4">
          {[
            "Deep audit of your store, funnel and acquisition",
            "Three highest-leverage growth moves",
            "Honest take on whether we're the right partner",
            "Zero sales pressure — promise.",
          ].map((p, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0" />
              <span>{p}</span>
            </div>
          ))}
        </div>
        <div className="md:col-span-3 glass-strong rounded-3xl p-8 text-center">
          <Calendar className="w-10 h-10 text-[var(--brand-cyan)] mx-auto" />
          <h3 className="mt-4 text-xl font-semibold">Pick a time that works</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-6">Calendar integration coming soon. For now, drop us a note and we'll send slots.</p>
          <div className="grid grid-cols-3 gap-2">
            {["Mon 10:00", "Mon 14:00", "Tue 09:30", "Tue 16:00", "Wed 11:00", "Wed 15:30"].map((s) => (
              <button key={s} className="glass hover:bg-white/10 rounded-lg py-2 text-sm transition">{s}</button>
            ))}
          </div>
          <button className="mt-6 px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow w-full">Reserve slot</button>
        </div>
      </section>
    </SiteLayout>
  );
}