import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { TrendingUp, Users, Globe, Search } from "lucide-react";

export const Route = createFileRoute("/traffic-checker")({
  head: () => ({
    meta: [
      { title: "Traffic Checker — Estimate Any Domain | NovaCommerce" },
      { name: "description", content: "Estimate organic traffic, top keywords, backlinks and domain authority for any site." },
    ],
  }),
  component: TrafficPage,
});

const trend = [22, 26, 31, 28, 34, 41, 38, 46, 52, 49, 58, 64, 71, 78, 84, 92];

function TrafficPage() {
  const max = Math.max(...trend);
  const w = 800, h = 200, step = w / (trend.length - 1);
  const path = trend.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`).join(" ");
  return (
    <SiteLayout>
      <PageHero eyebrow="Traffic Checker" title={<>Look inside any <span className="text-gradient-brand">domain</span>.</>} subtitle="Estimated traffic, organic keywords, backlinks and authority — in a single dashboard." />
      <section className="pb-24 mx-auto max-w-6xl px-4">
        <div className="glass-strong rounded-3xl p-6 md:p-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <input placeholder="example.com" className="flex-1 glass rounded-xl px-4 py-3 outline-none text-sm" />
            <button className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium">Check traffic</button>
          </div>

          <div className="grid sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon: Users, k: "428K", l: "Monthly visits" },
              { icon: Search, k: "12.4K", l: "Organic keywords" },
              { icon: Globe, k: "8.2K", l: "Backlinks" },
              { icon: TrendingUp, k: "DR 62", l: "Domain authority" },
            ].map((m, i) => (
              <div key={i} className="glass rounded-2xl p-5">
                <m.icon className="w-4 h-4 text-[var(--brand-mint)]" />
                <div className="text-2xl font-semibold mt-3 text-gradient">{m.k}</div>
                <p className="text-xs text-muted-foreground mt-1">{m.l}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 glass rounded-2xl p-5">
            <p className="text-sm font-medium mb-3">Traffic trend — 16 weeks</p>
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#tg)" />
              <path d={path} stroke="#00D4FF" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="mt-6 glass rounded-2xl p-5">
            <p className="text-sm font-medium mb-4">Top organic keywords</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr><th className="text-left py-2">Keyword</th><th className="text-left">Position</th><th className="text-left">Volume</th><th className="text-left">Traffic</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ["best running shoes", 3, "74K", "12.4K"],
                    ["organic skincare set", 5, "32K", "4.8K"],
                    ["minimalist watches", 2, "28K", "8.1K"],
                    ["scandinavian decor", 6, "19K", "2.7K"],
                    ["sustainable activewear", 4, "16K", "3.4K"],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td className="py-3">{r[0]}</td>
                      <td className="text-[var(--brand-mint)]">#{r[1]}</td>
                      <td className="text-muted-foreground">{r[2]}</td>
                      <td>{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}