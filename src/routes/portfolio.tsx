import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState } from "react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Shopify Stores We've Built | SaleshubsWebOffice" },
      { name: "description", content: "A premium gallery of Shopify storefronts, funnels and brand systems we've designed." },
    ],
  }),
  component: PortfolioPage,
});

type Item = { name: string; tag: string; url: string; grad: string };

const items: Item[] = [
  { name: "HiSleepTime", tag: "Shopify", url: "https://de.hisleeptime.com/", grad: "from-[#7B61FF] to-[#00D4FF]" },
  { name: "Amuze", tag: "Shopify", url: "https://amuze.myshopify.com/", grad: "from-[#00D4FF] to-[#14F195]" },
  { name: "Linea di Liara", tag: "Shopify", url: "https://lineadiliara.com/", grad: "from-[#14F195] to-[#7B61FF]" },
  { name: "Cilek Kids Room", tag: "Shopify", url: "https://www.cilekkidsroom.com/", grad: "from-[#8B5CF6] to-[#06B6D4]" },
  { name: "Design Skinz", tag: "Shopify", url: "https://designskinz.com/", grad: "from-[#7B61FF] to-[#14F195]" },
  { name: "Hyperlite", tag: "Shopify", url: "https://www.hyperlite.com/", grad: "from-[#06B6D4] to-[#7B61FF]" },
  { name: "Monbebe Couture", tag: "Shopify", url: "https://monbebecouture.com/", grad: "from-[#00D4FF] to-[#8B5CF6]" },
  { name: "Beddy's", tag: "Shopify", url: "https://beddys.com/", grad: "from-[#14F195] to-[#00D4FF]" },
  { name: "James Allen", tag: "Shopify Plus", url: "https://www.jamesallen.com/", grad: "from-[#8B5CF6] to-[#14F195]" },
  { name: "Bulletproof", tag: "Shopify Plus", url: "https://www.bulletproof.com/", grad: "from-[#7B61FF] to-[#00D4FF]" },
  { name: "All Good Outdoors", tag: "Shopify", url: "https://allgoodoutdoors.myshopify.com/", grad: "from-[#00D4FF] to-[#14F195]" },
  { name: "LNA Clothing", tag: "Shopify", url: "https://www.lnaclothing.com/", grad: "from-[#14F195] to-[#7B61FF]" },
  { name: "DTLR", tag: "Shopify Plus", url: "https://www.dtlr.com/", grad: "from-[#8B5CF6] to-[#06B6D4]" },
  { name: "GearHub Express", tag: "Shopify", url: "https://gearhubexpress.com/", grad: "from-[#7B61FF] to-[#14F195]" },
];
const filters = ["All", "Shopify", "Shopify Plus"];

const shotUrl = (u: string) =>
  `https://image.thum.io/get/width/1200/crop/900/noanimate/${u}`;

function PortfolioPage() {
  const [f, setF] = useState("All");
  const filtered = f === "All" ? items : items.filter((i) => i.tag === f);
  return (
    <SiteLayout>
      <PageHero eyebrow="Portfolio" title={<>Real Shopify stores <span className="text-gradient-brand">we've built</span>.</>} subtitle="Live previews of storefronts designed, optimized and launched by our team." />
      <section className="pb-24 mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((x) => (
            <button key={x} onClick={() => setF(x)} className={`px-4 py-2 rounded-full text-sm transition ${f === x ? "bg-gradient-brand text-white" : "glass hover:bg-white/10"}`}>{x}</button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((i, idx) => (
            <a
              key={idx}
              href={i.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative glass rounded-2xl overflow-hidden aspect-[4/3] hover:scale-[1.02] transition-transform block"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${i.grad} opacity-30 z-10 pointer-events-none`} />
              <img
                src={shotUrl(i.url)}
                alt={`${i.name} Shopify store preview`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
                <span className="text-[10px] uppercase tracking-widest text-white/70">{i.tag}</span>
                <h3 className="font-semibold text-lg text-white mt-1">{i.name}</h3>
                <p className="text-xs text-white/60 mt-1 truncate">{new URL(i.url).hostname}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}