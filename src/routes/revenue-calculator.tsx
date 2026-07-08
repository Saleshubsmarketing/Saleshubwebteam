import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/revenue-calculator")({
  head: () => ({ meta: [
    { title: "Revenue Opportunity Calculator | SaleshubsWebOffice" },
    { name: "description", content: "Forecast the revenue lift from CRO. Plug in traffic, CR and AOV." },
  ]}),
  component: Page,
});

function Field({ label, value, set, prefix }: { label: string; value: number; set: (n:number)=>void; prefix?: string }) {
  return (
    <label className="glass rounded-xl px-4 py-3 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-muted-foreground text-sm">{prefix}</span>}
        <input type="number" min={0} value={value} onChange={(e)=>set(Number(e.target.value)||0)} className="flex-1 bg-transparent outline-none text-lg font-medium" />
      </div>
    </label>
  );
}

function money(n: number) { return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }); }

function Page() {
  const [visitors, setVisitors] = useState(10000);
  const [cr, setCr] = useState(1.8);
  const [aov, setAov] = useState(85);
  const [targetCr, setTargetCr] = useState(3.2);

  const calc = useMemo(() => {
    const current = visitors * (cr/100) * aov;
    const potential = visitors * (targetCr/100) * aov;
    const lift = potential - current;
    return { current, potential, lift, liftPct: current > 0 ? (lift/current)*100 : 0 };
  }, [visitors, cr, aov, targetCr]);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Revenue Calculator"
        title={<>How much revenue are you <span className="text-gradient-brand">leaving on the table</span>?</>}
        subtitle="A 1% conversion rate lift on a real store often means six figures a year."
      />
      <section className="pb-24 mx-auto max-w-5xl px-4 grid lg:grid-cols-2 gap-6">
        <div className="glass-strong rounded-3xl p-6 grid gap-3">
          <Field label="Monthly visitors" value={visitors} set={setVisitors} />
          <Field label="Current conversion rate (%)" value={cr} set={setCr} />
          <Field label="Average order value" value={aov} set={setAov} prefix="$" />
          <Field label="Target conversion rate (%)" value={targetCr} set={setTargetCr} />
        </div>
        <div className="glass-strong rounded-3xl p-6 flex flex-col justify-center gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Current monthly revenue</p>
            <p className="text-3xl font-semibold mt-1">{money(calc.current)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Potential monthly revenue</p>
            <p className="text-3xl font-semibold mt-1 text-gradient">{money(calc.potential)}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase text-muted-foreground">Monthly opportunity</p>
            <p className="text-2xl font-semibold mt-1 text-[var(--brand-mint)]">+{money(calc.lift)}</p>
            <p className="text-xs text-muted-foreground mt-1">+{money(calc.lift*12)} annually · {calc.liftPct.toFixed(0)}% lift</p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}