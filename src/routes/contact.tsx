import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Mail, MessageCircle, Calendar, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactSchema, type ContactValues, revenueBands } from "@/lib/lead-schemas";
import { submitLeadClient } from "@/lib/submit-lead";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SaleshubsWebOffice" },
      {
        name: "description",
        content:
          "Get in touch. Book a strategy call, request a free audit or send us a message.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", store: "", message: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await submitLeadClient({
      form_type: "contact",
      full_name: values.name,
      email: values.email,
      website: values.store || "",
      budget: values.revenue || "",
      message: values.message,
    });
    if (!res.ok) {
      toast.error(res.error ?? "Something went wrong. Please try again.");
      return;
    }
    toast.success("Thank you!", {
      description: "Your request has been received. Our team will contact you within 24–72 hours.",
    });
    setSent(true);
  });

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let's build your <span className="text-gradient-brand">growth engine</span>.
          </>
        }
        subtitle="Average response time: under 2 hours during business days."
      />
      <section className="pb-24 mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 glass-strong rounded-3xl p-8">
          {sent ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-gradient-brand mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold">Message sent</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                We'll reply within 2 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name" error={form.formState.errors.name?.message}>
                  <input {...form.register("name")} className="input-glass" />
                </Field>
                <Field label="Email" error={form.formState.errors.email?.message}>
                  <input type="email" {...form.register("email")} className="input-glass" />
                </Field>
              </div>
              <Field label="Shopify store URL" error={form.formState.errors.store?.message}>
                <input
                  {...form.register("store")}
                  className="input-glass"
                  placeholder="https://"
                />
              </Field>
              <Field label="Monthly revenue" error={form.formState.errors.revenue?.message}>
                <select {...form.register("revenue")} className="input-glass" defaultValue="">
                  <option className="bg-[#0F172A]" value="" disabled>
                    Select a range…
                  </option>
                  {revenueBands.map((r) => (
                    <option key={r} className="bg-[#0F172A]" value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="How can we help?" error={form.formState.errors.message?.message}>
                <textarea
                  rows={5}
                  {...form.register("message")}
                  className="input-glass"
                  placeholder="Tell us about your store, goals and where you're stuck."
                />
              </Field>
              <button
                disabled={form.formState.isSubmitting}
                className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow flex items-center gap-2"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>Send message</>
                )}
              </button>
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

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground mb-1.5 block">{label}</span>
      {children}
      {error && <span className="text-xs text-red-400 mt-1.5 block">{error}</span>}
    </label>
  );
}