import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Mail, MessageCircle, Calendar, MapPin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — NovaCommerce" },
      { name: "description", content: "Get in touch. Book a strategy call, request a free audit or send us a message." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title={<>Let's build your <span className="text-gradient-brand">growth engine</span>.</>} subtitle="Average response time: under 2 hours during business days." />
      <section className="pb-24 mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 glass-strong rounded-3xl p-8">
          {sent ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-gradient-brand mx-auto flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold">Message sent</h3>
              <p className="text-muted-foreground mt-2 text-sm">We'll reply within 2 business hours.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name"><input required className="w-full glass rounded-xl px-4 py-3 outline-none text-sm" /></Field>
                <Field label="Email"><input required type="email" className="w-full glass rounded-xl px-4 py-3 outline-none text-sm" /></Field>
              </div>
              <Field label="Shopify store URL"><input className="w-full glass rounded-xl px-4 py-3 outline-none text-sm" placeholder="https://" /></Field>
              <Field label="Monthly revenue">
                <select className="w-full glass rounded-xl px-4 py-3 outline-none text-sm bg-transparent">
                  <option className="bg-[#0F172A]">Under $10k</option>
                  <option className="bg-[#0F172A]">$10k – $50k</option>
                  <option className="bg-[#0F172A]">$50k – $250k</option>
                  <option className="bg-[#0F172A]">$250k+</option>
                </select>
              </Field>
              <Field label="How can we help?"><textarea required rows={4} className="w-full glass rounded-xl px-4 py-3 outline-none text-sm" /></Field>
              <button className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow">Send message</button>
            </form>
          )}
        </div>
        <div className="space-y-3">
          {[
            { icon: Mail, t: "Email", v: "hello@novacommerce.io" },
            { icon: MessageCircle, t: "WhatsApp", v: "+1 (415) 555-0184" },
            { icon: Calendar, t: "Calendly", v: "Pick a 30-min slot" },
            { icon: MapPin, t: "HQ", v: "Remote · global team" },
          ].map((c, i) => (
            <div key={i} className="glass rounded-2xl p-5 hover:bg-white/[0.07] transition">
              <c.icon className="w-4 h-4 text-[var(--brand-cyan)]" />
              <p className="text-sm font-medium mt-3">{c.t}</p>
              <p className="text-sm text-muted-foreground mt-1">{c.v}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}