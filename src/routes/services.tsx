import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Mail,
  Search,
  Target,
  Layers,
  Megaphone,
  Globe,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Calendar,
  Zap,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      {
        title: "Services — Shopify Design, CRO, SEO, Email, Paid Ads | NovaCommerce",
      },
      {
        name: "description",
        content:
          "Full-service Shopify growth: design, redesign, CRO, email marketing, SEO, paid ads, funnels, social and Shopify management.",
      },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: ShoppingBag,
    title: "Shopify Design & Redesign",
    short:
      "Custom storefronts engineered for conversion. From new builds to full redesigns.",
    bullets: [
      "Custom Shopify & Shopify Plus builds",
      "Complete store redesigns",
      "Conversion-optimized layouts",
      "Mobile-first responsive UX",
      "Core Web Vitals speed tuning",
      "Premium theme customization",
    ],
    tools: ["Shopify", "Shopify Plus", "Liquid", "Figma", "Tailwind"],
    accent: "#7B61FF",
  },
  {
    icon: Mail,
    title: "Email Marketing",
    short:
      "Retention systems that drive 20-30% of total revenue through automated flows.",
    bullets: [
      "Klaviyo, Mailchimp, ConvertKit setup",
      "Abandoned cart recovery flows",
      "Welcome & VIP nurture series",
      "Advanced segmentation logic",
      "Revenue attribution tracking",
      "Deliverability & list hygiene",
    ],
    tools: ["Klaviyo", "ConvertKit", "Mailchimp", "GetResponse", "GoHighLevel"],
    accent: "#00D4FF",
  },
  {
    icon: Search,
    title: "SEO",
    short:
      "Organic growth infrastructure. Technical audits, content strategy, and authority building.",
    bullets: [
      "Technical SEO deep audits",
      "On-page & off-page optimization",
      "Keyword research & mapping",
      "Backlink acquisition strategy",
      "Schema markup implementation",
      "Shopify-specific SEO tuning",
    ],
    tools: ["Ahrefs", "SEMrush", "Screaming Frog", "Google Search Console"],
    accent: "#14F195",
  },
  {
    icon: Target,
    title: "Paid Ads",
    short:
      "Precision-targeted acquisition across every major platform with relentless ROAS focus.",
    bullets: [
      "Meta, Google, TikTok, Snap campaigns",
      "Retargeting & pixel perfection",
      "Conversion tracking setup",
      "Creative A/B testing at scale",
      "ROAS & LTV optimization",
      "Budget pacing & forecasting",
    ],
    tools: ["Meta Ads", "Google Ads", "TikTok Ads", "Snapchat Ads"],
    accent: "#F59E0B",
  },
  {
    icon: Layers,
    title: "Funnel Design",
    short:
      "High-converting funnels for sales, leads, memberships, and webinars.",
    bullets: [
      "Sales funnel architecture",
      "Membership & subscription funnels",
      "Affiliate & partner funnels",
      "Webinar & launch funnels",
      "Lead gen & tripwire systems",
      "GoHighLevel · ConvertKit · Systeme.io",
    ],
    tools: ["GoHighLevel", "ConvertKit", "Systeme.io", "ClickFunnels"],
    accent: "#EC4899",
  },
  {
    icon: Megaphone,
    title: "Social Media Marketing",
    short:
      "Organic social systems that build community and drive qualified traffic.",
    bullets: [
      "Instagram & Facebook content",
      "TikTok organic & paid strategy",
      "Pinterest commerce setup",
      "Content calendar & creative",
      "Community growth tactics",
      "Influencer outreach & collabs",
    ],
    tools: ["Instagram", "TikTok", "Pinterest", "Facebook", "Canva"],
    accent: "#8B5CF6",
  },
  {
    icon: Globe,
    title: "Shopify Management",
    short:
      "Day-to-day store operations handled so you can focus on growth.",
    bullets: [
      "Bulk product uploads & updates",
      "Inventory & order management",
      "App stack integration & setup",
      "Monthly store maintenance",
      "Performance & speed monitoring",
      "Analytics dashboards & reporting",
    ],
    tools: ["Shopify Admin", "Recharge", "Judge.me", "Gorgias", "Klaviyo"],
    accent: "#06B6D4",
  },
  {
    icon: Rocket,
    title: "Commerce Shop Setup",
    short:
      "Unlock native shopping across every social platform with catalog sync.",
    bullets: [
      "Facebook & Instagram Shop",
      "TikTok Shop onboarding",
      "Pinterest Product Pins",
      "Catalog & feed integration",
      "Automated sync & updates",
      "Platform-specific optimization",
    ],
    tools: ["Meta Commerce", "TikTok Shop", "Pinterest API", "Feedonomics"],
    accent: "#22C55E",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[number];
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const Icon = service.icon;

  return (
    <motion.div
      variants={cardVariants}
      className={`glass rounded-3xl p-6 md:p-8 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] group ${
        open ? "ring-1 ring-white/15" : ""
      }`}
      onClick={() => setOpen((v) => !v)}
      layout
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: service.accent }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">
              {service.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {service.short}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0 mt-1"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </div>

      {/* Tool badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        {service.tools.map((tool) => (
          <span
            key={tool}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-muted-foreground"
          >
            {tool}
          </span>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-5 mt-5 border-t border-white/10">
              <ul className="grid sm:grid-cols-2 gap-y-2 gap-x-4">
                {service.bullets.map((b, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: service.accent }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex gap-3">
                <Link
                  to="/free-audit"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Free Audit
                </Link>
                <Link
                  to="/book-call"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition"
                  style={{
                    background: service.accent,
                    color: "#fff",
                  }}
                >
                  <Calendar className="w-3.5 h-3.5" /> Book Call
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ServicesPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Services"
        title={
          <>
            The complete{" "}
            <span className="text-gradient-brand">Shopify growth stack</span>.
          </>
        }
        subtitle="Design, conversion, retention, acquisition and operations — built as one system."
      />

      {/* Service Cards Grid */}
      <section className="pb-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-5"
        >
          {services.map((s, i) => (
            <ServiceCard key={i} service={s} index={i} />
          ))}
        </motion.div>
      </section>

      {/* Mid-page CTA — Free Audit */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="relative overflow-hidden rounded-3xl glass-strong p-8 md:p-12 text-center">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-6 glow-violet">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Not sure where to start? Get a{" "}
                <span className="text-gradient-brand">free audit</span>.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Our senior strategists will diagnose your store, funnel, and
                acquisition — then map the three highest-leverage moves you can
                make right now.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/free-audit"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-brand text-white font-medium btn-glow"
                >
                  Start free audit <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/book-call"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl glass hover:bg-white/10 transition"
                >
                  <Calendar className="w-4 h-4" /> Book a strategy call
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-mint)]" />{" "}
                  10–15 page report
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-mint)]" />{" "}
                  72-hour delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-mint)]" />{" "}
                  Zero obligation
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Ecosystem Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-4">
              <BarChart3 className="w-3.5 h-3.5" /> Tool Stack
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Built on the tools you already{" "}
              <span className="text-gradient-brand">trust</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              We don't force proprietary tech. We master the platforms that
              power modern eCommerce.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "Shopify",
              "Shopify Plus",
              "Klaviyo",
              "Meta Ads",
              "Google Ads",
              "TikTok Ads",
              "Ahrefs",
              "SEMrush",
              "ConvertKit",
              "Mailchimp",
              "GoHighLevel",
              "Recharge",
              "Judge.me",
              "Gorgias",
              "Figma",
              "Tailwind",
              "Liquid",
              "Schema.org",
            ].map((tool) => (
              <motion.div
                key={tool}
                whileHover={{ scale: 1.05 }}
                className="glass rounded-xl px-4 py-4 text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.07] transition cursor-default"
              >
                {tool}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results / Trust strip */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="glass rounded-3xl p-8 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Stores Launched", value: "120+", icon: ShoppingBag },
                { label: "Avg ROAS Improvement", value: "3.2x", icon: TrendingUp },
                { label: "Email Revenue Share", value: "28%", icon: Mail },
                { label: "Client Retention", value: "94%", icon: CheckCircle2 },
              ].map((stat) => {
                const StatIcon = stat.icon;
                return (
                  <div key={stat.label} className="space-y-2">
                    <StatIcon
                      className="w-5 h-5 mx-auto"
                      style={{ color: "var(--brand-cyan)" }}
                    />
                    <div className="text-3xl font-bold text-gradient">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA — Book Call */}
      <section className="py-16 pb-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-violet)]/20 via-transparent to-[var(--brand-cyan)]/10 rounded-3xl" />
            <div className="absolute inset-0 glass rounded-3xl" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-aurora flex items-center justify-center mx-auto mb-6 glow-cyan">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Ready to accelerate your{" "}
                <span className="text-gradient-brand">growth</span>?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Book a free 30-minute strategy call. We'll map your three
                highest-leverage moves and give you an honest take on next
                steps.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/book-call"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-brand text-white font-medium btn-glow"
                >
                  Book strategy call <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/free-audit"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl glass hover:bg-white/10 transition"
                >
                  <Sparkles className="w-4 h-4" /> Request free audit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
