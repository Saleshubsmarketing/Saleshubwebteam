import { Link } from "@tanstack/react-router";
import { Sparkles, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/5">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-brand rounded-lg p-2">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg">
                Saleshubs<span className="text-gradient-brand">WebTeam</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              The elite eCommerce growth partner for Shopify brands. Design, CRO, SEO, email & paid systems built to scale.
            </p>
            <div className="flex gap-3 mt-6">
              {[Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg glass hover:bg-white/10 transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Company" links={[
            { to: "/about", label: "About" },
            { to: "/case-studies", label: "Case Studies" },
            { to: "/portfolio", label: "Portfolio" },
            { to: "/testimonials", label: "Testimonials" },
          ]} />
          <FooterCol title="Services" links={[
            { to: "/services", label: "Shopify Design" },
            { to: "/services", label: "Email Marketing" },
            { to: "/services", label: "SEO" },
            { to: "/services", label: "Paid Ads" },
          ]} />
          <FooterCol title="Tools" links={[
            { to: "/website-analyzer", label: "Website Analyzer" },
            { to: "/seo-analyzer", label: "SEO Analyzer" },
            { to: "/traffic-checker", label: "Traffic Checker" },
            { to: "/free-audit", label: "Free Audit" },
          ]} />
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SaleshubsWebOffice. All rights reserved.</p>
          <p>Built for ambitious Shopify brands.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-semibold text-sm mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l, i) => (
          <li key={i}>
            <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}