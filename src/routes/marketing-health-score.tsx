import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/marketing-health-score")({
  head: () => ({ meta: [
    { title: "Marketing Health Score | SaleshubsWebOffice" },
    { name: "description", content: "Composite growth score across SEO, website, email, ads, social and funnels." },
  ]}),
  component: Page,
});

const axes = [
  { key: "seo", label: "SEO" },
  { key: "website", label: "Website" },
  { key: "email", label: "Email" },
  { key: "ads", label: "Paid Ads" },
  { key: "social", label: "Social" },
  { key: "funnel", label: "Funnels" },
] as const;

function Page() {
  const [v, setV] = useState<Record<string, number>>({ seo: 60, website: 55, email: 40, ads: 65, social: 50, funnel: 35 });
  const overall = useMemo(() => Math.round(Object.values(v).reduce((a,b)=>a+b,0)/axes.length), [v]);

  // radar
  const size = 280, cx = size/2, cy = size/2, R = 110;
  const points = axes.map((a, i) => {
    const angle = (Math.PI*2*i)/axes.length - Math.PI/2;
    const r = (v[a.key]/100) * R;
    return [cx + Math.cos(angle)*r, cy + Math.sin(angle)*r];
  });
  const path = points.map(([x,y],i)=>`${i===0?"M":"L"}${x},${y}`).join(" ") + " Z";
  const rings = [0.25, 0.5, 0.75, 1].map(f =>
    axes.map((_,i) => {
      const a = (Math.PI*2*i)/axes.length - Math.PI/2;
      return [cx + Math.cos(a)*R*f, cy + Math.sin(a)*R*f];
    })
  );

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Marketing Health Score"
        title={<>One score for your <span className="text-gradient-brand">whole growth engine</span>.</>}
        subtitle="Rate each channel honestly — get a composite growth score and radar."
      />
      <section className="pb-24 mx-auto max-w-5xl px-4 grid lg:grid-cols-2 gap-6">
        <div className="glass-strong rounded-3xl p-6 grid gap-4">
          {axes.map(a => (
            <label key={a.key} className="grid gap-1">
              <div className="flex justify-between text-sm"><span>{a.label}</span><span className="text-muted-foreground">{v[a.key]}</span></div>
              <input type="range" min={0} max={100} value={v[a.key]} onChange={(e)=>setV(d=>({...d,[a.key]:Number(e.target.value)}))} className="accent-[var(--brand-mint)]"/>
            </label>
          ))}
        </div>
        <div className="glass-strong rounded-3xl p-6 flex flex-col items-center">
          <svg width={size} height={size}>
            {rings.map((ring, i) => (
              <polygon key={i} points={ring.map(p=>p.join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.08)"/>
            ))}
            <path d={path} fill="rgba(255,107,74,0.25)" stroke="rgb(255,107,74)" strokeWidth={2}/>
            {axes.map((a, i) => {
              const angle = (Math.PI*2*i)/axes.length - Math.PI/2;
              const lx = cx + Math.cos(angle)*(R+18);
              const ly = cy + Math.sin(angle)*(R+18);
              return <text key={a.key} x={lx} y={ly} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.6)">{a.label}</text>;
            })}
          </svg>
          <p className="text-xs uppercase text-muted-foreground mt-4">Overall growth score</p>
          <p className="text-5xl font-semibold text-gradient mt-1">{overall}</p>
        </div>
      </section>
    </SiteLayout>
  );
}