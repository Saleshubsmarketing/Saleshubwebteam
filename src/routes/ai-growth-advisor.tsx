import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { growthAdvisor } from "@/lib/growth-advisor.functions";
import { Loader2, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/ai-growth-advisor")({
  head: () => ({ meta: [
    { title: "AI Growth Advisor | SaleshubsWebOffice" },
    { name: "description", content: "AI-powered eCommerce growth strategy across SEO, funnel, email and ads." },
  ]}),
  component: Page,
});

type R = Extract<Awaited<ReturnType<typeof growthAdvisor>>, { ok: true }>;

function Page() {
  const run = useServerFn(growthAdvisor);
  const [url, setUrl] = useState("");
  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [r, setR] = useState<R | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim() || !niche.trim()) return;
    setLoading(true); setErr(null); setR(null);
    try {
      const res = await run({ data: { url: url.trim(), niche: niche.trim(), goal } });
      if (res.ok) setR(res); else setErr(res.error);
    } catch (x: any) { setErr(x?.message ?? "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="AI Growth Advisor"
        title={<>Your <span className="text-gradient-brand">AI growth strategist</span>, on demand.</>}
        subtitle="Concrete recommendations across SEO, funnel, email, paid ads and social."
      />
      <section className="pb-24 mx-auto max-w-5xl px-4">
        <form onSubmit={submit} className="glass-strong rounded-3xl p-6 grid gap-3">
          <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="Store URL (https://...)" className="glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none"/>
          <input value={niche} onChange={(e)=>setNiche(e.target.value)} placeholder="Niche (e.g. luxury skincare, men's streetwear)" className="glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none"/>
          <textarea value={goal} onChange={(e)=>setGoal(e.target.value)} placeholder="Goal (optional): e.g. double email revenue this quarter" rows={2} className="glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none resize-none"/>
          <button disabled={loading} className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
            {loading ? "Thinking…" : "Generate strategy"}
          </button>
        </form>

        {err && (
          <div className="mt-6 glass rounded-2xl p-4 border border-red-500/30 flex gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0"/>
            <p className="text-muted-foreground">{err}</p>
          </div>
        )}

        {r && (
          <div className="mt-8 space-y-4">
            <div className="glass-strong rounded-3xl p-6">
              <p className="text-xs uppercase text-muted-foreground">Strategic summary</p>
              <p className="mt-2 text-base">{r.summary}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {r.sections.map((s, i) => (
                <div key={i} className="glass rounded-2xl p-5">
                  <p className="font-semibold mb-3 text-gradient">{s.title}</p>
                  <ul className="space-y-2 text-sm">
                    {s.items.map((it, j) => (
                      <li key={j} className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0"/>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}