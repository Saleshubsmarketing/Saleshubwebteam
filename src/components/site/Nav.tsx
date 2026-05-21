import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/case-studies", label: "Case Studies" },
  { to: "/website-analyzer", label: "Analyzer" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 ${
            scrolled ? "glass-strong" : "glass"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg blur-md bg-gradient-brand opacity-70 group-hover:opacity-100 transition" />
              <div className="relative bg-gradient-brand rounded-lg p-2">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="font-semibold tracking-tight text-lg">
              Nova<span className="text-gradient-brand">Commerce</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition rounded-md hover:bg-white/5"
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/free-audit"
              className="hidden md:inline-flex text-sm px-4 py-2 rounded-lg glass hover:bg-white/10 transition"
            >
              Free Audit
            </Link>
            <Link
              to="/book-call"
              className="hidden sm:inline-flex text-sm px-4 py-2 rounded-lg bg-gradient-brand text-white font-medium hover:opacity-90 transition shadow-[0_0_24px_rgba(123,97,255,0.4)]"
            >
              Book Call
            </Link>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-white/5"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden mt-2 glass-strong rounded-2xl p-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/free-audit"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-md text-sm hover:bg-white/5"
            >
              Free Audit
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}