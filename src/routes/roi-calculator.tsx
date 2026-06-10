import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/roi-calculator")({
  head: () => ({ meta: [
    { title: "Marketing ROI Calculator | SaleshubsWebTeam" },
    { name: "description", content: "Calculate ROI for SEO, email, paid ads and funnel investments." },
  ]}),
  component: Page,
});

const channels = [
  { key: "seo", label: "SEO" },
  { key: "email", label: "Email Marketing" },
  { key: "ads", label: "Paid Ads" },
  { key: "funnel", label: "Funnel" },
] as const;

type Row = { spend: number; revenue: number };
function money(n: number) { return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }); }

function Page() {
  const [data, setData] = useState<Record<string, Row>>({
    seo: { spend: 2000, revenue: 12000 },
    email: { spend: 500, revenue: 6000 },
    ads: { spend: 5000, revenue: 18000 },
    funnel: { spend: 1500, revenue: 9000 },
  });

  const totals = useMemo(() => {
    const spend = Object.values(data).reduce((a, r) => a + r.spend, 0);
    const rev = Object.values(data).reduce((a, r) => a + r.revenue, 0);
    return { spend, rev, roi: spend > 0 ? ((rev - spend)/spend)*100 : 0 };
  }, [data]);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="ROI Calculator"
        title={<>Channel-by-channel <span className="text-gradient-brand">ROI</span>.</>}
        subtitle="Know which channel is making you money — and which is bleeding it."
      />
      <section className="pb-24 mx-auto max-w-5xl px-4">
        <div className="glass-strong rounded-3xl p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground text-xs uppercase">
                <th className="py-2">Channel</th>
                <th className="py-2">Spend</th>
                <th className="py-2">Revenue</th>
                <th className="py-2">ROI</th>
                <th className="py-2 w-1/3">Performance</th>
              </tr>
            </thead>
            <tbody>
              {channels.map(c => {
                const row = data[c.key];
                const roi = row.spend > 0 ? ((row.revenue - row.spend)/row.spend)*100 : 0;
                return (
                  <tr key={c.key} className="border-t border-white/5">
                    <td className="py-3 font-medium">{c.label}</td>
                    <td className="py-3"><input type="number" value={row.spend} onChange={(e)=>setData(d=>({...d,[c.key]:{...d[c.key],spend:Number(e.target.value)||0}}))} className="glass rounded-md px-2 py-1 w-28 bg-transparent outline-none"/></td>
                    <td className="py-3"><input type="number" value={row.revenue} onChange={(e)=>setData(d=>({...d,[c.key]:{...d[c.key],revenue:Number(e.target.value)||0}}))} className="glass rounded-md px-2 py-1 w-28 bg-transparent outline-none"/></td>
                    <td className={`py-3 font-semibold ${roi >= 0 ? "text-[var(--brand-mint)]" : "text-red-400"}`}>{roi.toFixed(0)}%</td>
                    <td className="py-3">
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-gradient-brand" style={{width: `${Math.min(100, Math.max(0, roi/5))}%`}}/>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            <div className="glass rounded-xl p-4"><p className="text-xs uppercase text-muted-foreground">Total spend</p><p className="text-2xl font-semibold mt-1">{money(totals.spend)}</p></div>
            <div className="glass rounded-xl p-4"><p className="text-xs uppercase text-muted-foreground">Total revenue</p><p className="text-2xl font-semibold mt-1">{money(totals.rev)}</p></div>
            <div className="glass rounded-xl p-4"><p className="text-xs uppercase text-muted-foreground">Blended ROI</p><p className="text-2xl font-semibold mt-1 text-gradient">{totals.roi.toFixed(0)}%</p></div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}