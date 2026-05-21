import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState } from "react";
import { Search, Clock } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Shopify Growth Insights | NovaCommerce" },
      { name: "description", content: "Playbooks on Shopify design, CRO, email marketing, SEO and paid ads — by operators who run them daily." },
    ],
  }),
  component: BlogPage,
});

const posts = [
  { t: "The 7-step Shopify CRO audit we run on every store", c: "CRO", r: "8 min", g: "from-[#7B61FF] to-[#00D4FF]" },
  { t: "How we built a $480k Klaviyo program in 90 days", c: "Email", r: "12 min", g: "from-[#00D4FF] to-[#14F195]" },
  { t: "Shopify SEO in 2026: what actually moves rankings", c: "SEO", r: "10 min", g: "from-[#14F195] to-[#7B61FF]" },
  { t: "Meta ads: a creative testing system that scales", c: "Paid", r: "9 min", g: "from-[#8B5CF6] to-[#06B6D4]" },
  { t: "Inside a funnel that converts at 6.8%", c: "Funnels", r: "7 min", g: "from-[#7B61FF] to-[#14F195]" },
  { t: "Pinterest is quietly the best traffic source you're missing", c: "Social", r: "6 min", g: "from-[#00D4FF] to-[#8B5CF6]" },
];
const cats = ["All", "CRO", "Email", "SEO", "Paid", "Funnels", "Social"];

function BlogPage() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const visible = posts.filter((p) => (cat === "All" || p.c === cat) && p.t.toLowerCase().includes(q.toLowerCase()));
  return (
    <SiteLayout>
      <PageHero eyebrow="Blog" title={<>Playbooks for <span className="text-gradient">eCommerce growth</span>.</>} subtitle="Tactics we use on real Shopify stores — no fluff." />
      <section className="pb-24 mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="flex-1 flex items-center glass rounded-xl px-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className="bg-transparent outline-none px-3 py-3 w-full text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`px-3 py-2 rounded-lg text-xs ${cat === c ? "bg-gradient-brand text-white" : "glass hover:bg-white/10"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((p, i) => (
            <article key={i} className="group glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform">
              <div className={`aspect-[16/10] bg-gradient-to-br ${p.g} relative overflow-hidden`}>
                <div className="absolute inset-0 grid-bg opacity-40" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="px-2 py-0.5 rounded-full glass">{p.c}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.r}</span>
                </div>
                <h3 className="font-semibold leading-snug">{p.t}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}