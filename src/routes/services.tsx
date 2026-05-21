import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { ShoppingBag, Mail, Search, Target, Layers, Megaphone, Globe, Rocket, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Shopify Design, CRO, SEO, Email, Paid Ads | NovaCommerce" },
      { name: "description", content: "Full-service Shopify growth: design, redesign, CRO, email marketing, SEO, paid ads, funnels, social and Shopify management." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { icon: ShoppingBag, title: "Shopify Design & Redesign", bullets: ["Custom Shopify & Shopify Plus", "Redesign existing stores", "Conversion optimization", "Mobile-first UX", "Speed optimization", "Premium layouts"] },
  { icon: Mail, title: "Email Marketing", bullets: ["Klaviyo, GetResponse, Mailchimp, ConvertKit, GoHighLevel, Systeme.io", "Automation flows", "Abandoned cart recovery", "Welcome & VIP series", "Segmentation", "Revenue tracking"] },
  { icon: Search, title: "SEO", bullets: ["Technical SEO audit", "On-page & off-page", "Keyword research", "Backlinks", "Schema markup", "Shopify SEO optimization"] },
  { icon: Target, title: "Paid Ads", bullets: ["Meta, Google, TikTok, Snap, Classified", "Retargeting & pixel setup", "Conversion tracking", "A/B creative testing", "ROAS optimization"] },
  { icon: Layers, title: "Funnel Design", bullets: ["Sales funnels", "Membership funnels", "Affiliate funnels", "Webinar funnels", "Lead generation", "GoHighLevel · ConvertKit · Systeme.io"] },
  { icon: Megaphone, title: "Social Media Marketing", bullets: ["Instagram & Facebook", "TikTok", "Pinterest", "Content strategy", "Community growth", "Brand management"] },
  { icon: Globe, title: "Shopify Management", bullets: ["Product uploads", "Inventory & orders", "App integration", "Store maintenance", "Performance optimization", "Analytics monitoring"] },
  { icon: Rocket, title: "Commerce Shop Setup", bullets: ["Facebook Shop", "Instagram Shop", "TikTok Shop", "Pinterest Shop", "Catalog & feed integration", "Automation"] },
];

function ServicesPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Services" title={<>The complete <span className="text-gradient-brand">Shopify growth stack</span>.</>} subtitle="Design, conversion, retention, acquisition and operations — built as one system." />
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-5">
          {services.map((s, i) => (
            <div key={i} className="glass rounded-3xl p-8 hover:bg-white/[0.07] transition">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
              </div>
              <ul className="grid sm:grid-cols-2 gap-y-2 gap-x-4">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link to="/book-call" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow">
            Book a strategy call <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}