import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Star, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — What Founders Say | SaleshubsWebTeam" },
      { name: "description", content: "Verified reviews from Shopify founders and CMOs we've scaled." },
    ],
  }),
  component: TPage,
});

const reviews = [
  { n: "Sara Lindqvist", r: "CEO, Aurora Skincare", q: "Revenue 3x in 6 months. The strategy + execution combo is unmatched.", rating: 5 },
  { n: "Marcus Chen", r: "Founder, Vertex Athletics", q: "Klaviyo program added $480k in 90 days. Worth every penny.", rating: 5 },
  { n: "Priya Anand", r: "CMO, Nordic & Co.", q: "ROAS doubled. Creative team ships faster than our in-house team.", rating: 5 },
  { n: "Diego Romero", r: "Founder, Halo Goods", q: "We feel in control of growth for the first time. Elite team.", rating: 5 },
  { n: "Hannah Park", r: "COO, Prism Beauty", q: "The CRO experiments alone paid for the year. Brilliant operators.", rating: 5 },
  { n: "Tom Whittaker", r: "Founder, Atlas Outdoor", q: "SEO traffic up 218% in two quarters. Real, lasting growth.", rating: 5 },
];

function TPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Testimonials" title={<>What <span className="text-gradient">operators</span> say.</>} subtitle="A few of the 280+ Shopify brands we've helped scale." />
      <section className="pb-24 mx-auto max-w-7xl px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((q, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {Array.from({ length: q.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[var(--brand-mint)] text-[var(--brand-mint)]" />
                  ))}
                </div>
                <BadgeCheck className="w-4 h-4 text-[var(--brand-cyan)]" />
              </div>
              <p className="mt-4 text-sm leading-relaxed">"{q.q}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">
                  {q.n.split(" ").map((w) => w[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{q.n}</p>
                  <p className="text-xs text-muted-foreground">{q.r}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}