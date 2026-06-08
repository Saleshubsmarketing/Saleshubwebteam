import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Search, Link as LinkIcon, FileText, Hash } from "lucide-react";

export const Route = createFileRoute("/seo-analyzer")({
  head: () => ({
    meta: [
      { title: "Free SEO Analyzer | SaleshubsWebTeam" },
      { name: "description", content: "Scan your site for SEO health: on-page, technical, schema, content gaps and backlink opportunities." },
    ],
  }),
  component: SEOAnalyzerPage,
});

function SEOAnalyzerPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="SEO Analyzer" title={<>Find every <span className="text-gradient">SEO win</span> hiding in your store.</>} subtitle="On-page, technical, schema, backlinks and content gaps — scored and prioritized." />
      <section className="pb-24 mx-auto max-w-5xl px-4">
        <div className="glass-strong rounded-3xl p-6 md:p-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <input placeholder="https://yourstore.com" className="flex-1 glass rounded-xl px-4 py-3 outline-none text-sm" />
            <button className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium">Analyze</button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {[
              { icon: Search, label: "On-page score", v: "82" },
              { icon: FileText, label: "Indexed pages", v: "1,284" },
              { icon: LinkIcon, label: "Backlinks", v: "4,712" },
              { icon: Hash, label: "Ranking keywords", v: "1,840" },
            ].map((m, i) => (
              <div key={i} className="glass rounded-2xl p-5">
                <m.icon className="w-4 h-4 text-[var(--brand-cyan)]" />
                <div className="text-2xl font-semibold mt-3 text-gradient">{m.v}</div>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}