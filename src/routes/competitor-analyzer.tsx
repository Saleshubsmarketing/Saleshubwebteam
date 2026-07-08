import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { semrushDomainSnapshot } from "@/lib/semrush.functions";
import { Loader2, Swords, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/competitor-analyzer")({
  head: () => ({ meta: [
    { title: "Competitor Analyzer | SaleshubsWebOffice" },
    { name: "description", content: "Compare two domains head-to-head with live Semrush data." },
  ]}),
  component: Page,
});

type Snap = Extract<Awaited<ReturnType<typeof semrushDomainSnapshot>>, { ok: true }>;

function fmt(n: number) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(n));
}

function Page() {
  const fetchSnap = useServerFn(semrushDomainSnapshot);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<{ a: Snap; b: Snap } | null>(null);

  const run = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!a.trim() || !b.trim()) return;
    setLoading(true); setErr(null); setRes(null);
    try {
      const [ra, rb] = await Promise.all([
        fetchSnap({ data: { domain: a.trim(), database: "us" } }),
        fetchSnap({ data: { domain: b.trim(), database: "us" } }),
      ]);
      if (!ra.ok) return setErr(ra.error);
      if (!rb.ok) return setErr(rb.error);
      setRes({ a: ra, b: rb });
    } catch (x: any) { setErr(x?.message ?? "Failed"); }
    finally { setLoading(false); }
  };

  const rows: Array<{ label: string; key: keyof Snap; fmt?: (n: number) => string }> = [
    { label: "Organic traffic / mo", key: "organicTraffic", fmt },
    { label: "Organic keywords", key: "organicKeywords", fmt },
    { label: "Backlinks", key: "backlinks", fmt },
    { label: "Referring domains", key: "refDomains", fmt },
    { label: "Authority score", key: "authority" },
    { label: "Paid keywords", key: "paidKeywords", fmt },
  ];

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Competitor Analyzer"
        title={<>Two domains. <span className="text-gradient-brand">One winner.</span></>}
        subtitle="Real-time Semrush comparison across traffic, keywords and backlinks."
      />
      <section className="pb-24 mx-auto max-w-6xl px-4">
        <form onSubmit={run} className="glass-strong rounded-3xl p-6 grid md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-center">
          <input value={a} onChange={(e)=>setA(e.target.value)} placeholder="yourdomain.com" className="glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none" />
          <Swords className="w-5 h-5 text-muted-foreground mx-auto" />
          <input value={b} onChange={(e)=>setB(e.target.value)} placeholder="competitor.com" className="glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none" />
          <button disabled={loading} className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium flex items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
            {loading ? "Comparing…" : "Compare"}
          </button>
        </form>

        {err && (
          <div className="mt-6 glass rounded-2xl p-4 border border-red-500/30 flex gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0"/>
            <p className="text-muted-foreground">{err}</p>
          </div>
        )}

        {res && (
          <div className="mt-8 glass-strong rounded-3xl p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-3">Metric</th>
                  <th className="py-3">{res.a.domain}</th>
                  <th className="py-3">{res.b.domain}</th>
                  <th className="py-3">Leader</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const av = res.a[r.key] as number;
                  const bv = res.b[r.key] as number;
                  const leader = av === bv ? "—" : av > bv ? res.a.domain : res.b.domain;
                  const f = r.fmt ?? ((n: number) => String(n));
                  return (
                    <tr key={r.label} className="border-t border-white/5">
                      <td className="py-3 text-muted-foreground">{r.label}</td>
                      <td className={`py-3 font-medium ${av >= bv ? "text-[var(--brand-mint)]" : ""}`}>{f(av)}</td>
                      <td className={`py-3 font-medium ${bv >= av ? "text-[var(--brand-mint)]" : ""}`}>{f(bv)}</td>
                      <td className="py-3 text-xs">{leader}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}