import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState } from "react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Shopify Stores We've Built | NovaCommerce" },
      { name: "description", content: "A premium gallery of Shopify storefronts, funnels and brand systems we've designed." },
    ],
  }),
  component: PortfolioPage,
});

const items = [
  { name: "Aurora Skincare", tag: "Shopify", grad: "from-[#7B61FF] to-[#00D4FF]" },
  { name: "Vertex Athletics", tag: "Paid Ads", grad: "from-[#00D4FF] to-[#14F195]" },
  { name: "Nordic & Co.", tag: "SEO", grad: "from-[#14F195] to-[#7B61FF]" },
  { name: "Halo Goods", tag: "Funnels", grad: "from-[#8B5CF6] to-[#06B6D4]" },
  { name: "Prism Beauty", tag: "Email Marketing", grad: "from-[#7B61FF] to-[#14F195]" },
  { name: "Atlas Outdoor", tag: "Social Media", grad: "from-[#06B6D4] to-[#7B61FF]" },
  { name: "Meridian Coffee", tag: "Shopify", grad: "from-[#00D4FF] to-[#8B5CF6]" },
  { name: "Ember Home", tag: "SEO", grad: "from-[#14F195] to-[#00D4FF]" },
  { name: "Palette Studio", tag: "Funnels", grad: "from-[#8B5CF6] to-[#14F195]" },
];
const filters = ["All", "Shopify", "SEO", "Funnels", "Paid Ads", "Social Media", "Email Marketing"];

function PortfolioPage() {
  const [f, setF] = useState("All");
  const filtered = f === "All" ? items : items.filter((i) => i.tag === f);
  return (
    <SiteLayout>
      <PageHero eyebrow="Portfolio" title={<>A gallery of <span className="text-gradient-brand">conversion</span>.</>} subtitle="Selected work across Shopify, funnels, paid, SEO, email and brand." />
      <section className="pb-24 mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((x) => (
            <button key={x} onClick={() => setF(x)} className={`px-4 py-2 rounded-full text-sm transition ${f === x ? "bg-gradient-brand text-white" : "glass hover:bg-white/10"}`}>{x}</button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((i, idx) => (
            <div key={idx} className="group relative glass rounded-2xl overflow-hidden aspect-[4/3] hover:scale-[1.02] transition-transform">
              <div className={`absolute inset-0 bg-gradient-to-br ${i.grad} opacity-40 group-hover:opacity-60 transition`} />
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
                <span className="text-[10px] uppercase tracking-widest text-white/70">{i.tag}</span>
                <h3 className="font-semibold text-lg text-white mt-1">{i.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}