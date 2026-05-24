import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Clock,
} from "lucide-react";
import {
  auditSchema,
  type AuditValues,
  revenueBands,
  goals,
} from "@/lib/lead-schemas";

export const Route = createFileRoute("/free-audit")({
  head: () => ({
    meta: [
      { title: "Free Shopify Audit | NovaCommerce" },
      {
        name: "description",
        content:
          "Get a free, hand-built Shopify audit covering design, CRO, SEO and email — delivered in 72 hours.",
      },
    ],
  }),
  component: AuditPage,
});

const STEPS = ["Your store", "Your goals", "Contact"] as const;
const FIELDS: Array<Array<keyof AuditValues>> = [
  ["store", "revenue"],
  ["goal", "notes"],
  ["name", "email"],
];

function AuditPage() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);

  const form = useForm<AuditValues>({
    resolver: zodResolver(auditSchema),
    mode: "onTouched",
    defaultValues: {
      store: "",
      revenue: revenueBands[1],
      goal: goals[0],
      notes: "",
      name: "",
      email: "",
    },
  });

  const next = async () => {
    const ok = await form.trigger(FIELDS[step]);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    await new Promise((r) => setTimeout(r, 900));
    toast.success("Audit request received", {
      description: `We'll email ${values.email} within 72 hours.`,
    });
    setSent(true);
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Free audit"
        title={
          <>
            A <span className="text-gradient-brand">hand-built</span> Shopify audit. On us.
          </>
        }
        subtitle="Delivered in 72 hours by a senior strategist. No bots. No templates."
      />
      <section className="pb-24 mx-auto max-w-6xl px-4 grid md:grid-cols-5 gap-5">
        <aside className="md:col-span-2 space-y-4">
          <div className="glass rounded-3xl p-7 space-y-4">
            <Sparkles className="w-6 h-6 text-[var(--brand-mint)]" />
            <h3 className="text-xl font-semibold">What you'll receive</h3>
            {[
              "10–15 page custom audit PDF",
              "Conversion rate diagnosis",
              "Top 10 prioritized fixes",
              "Email & SEO opportunities",
              "Projected revenue impact",
            ].map((p) => (
              <div key={p} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0" />
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-5 flex items-center gap-3 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-[var(--brand-cyan)]" />
            We never share your store data. Audit-only.
          </div>
          <div className="glass rounded-2xl p-5 flex items-center gap-3 text-xs text-muted-foreground">
            <Clock className="w-4 h-4 text-[var(--brand-cyan)]" />
            Average turnaround: 48 hours.
          </div>
        </aside>

        <div className="md:col-span-3 glass-strong rounded-3xl p-8">
          {sent ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-12 h-12 text-[var(--brand-mint)] mx-auto" />
              <h3 className="mt-5 text-2xl font-semibold">You're in</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Audit lands in your inbox within 72 hours.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>
                    Step {step + 1} of {STEPS.length} — {STEPS[step]}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-brand"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {step === 0 && (
                      <>
                        <Field label="Shopify store URL" error={form.formState.errors.store?.message}>
                          <input
                            {...form.register("store")}
                            placeholder="https://yourstore.com"
                            className="input-glass"
                          />
                        </Field>
                        <Field label="Monthly revenue" error={form.formState.errors.revenue?.message}>
                          <select {...form.register("revenue")} className="input-glass">
                            {revenueBands.map((r) => (
                              <option key={r} className="bg-[#0F172A]">
                                {r}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </>
                    )}
                    {step === 1 && (
                      <>
                        <Field label="Primary goal" error={form.formState.errors.goal?.message}>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {goals.map((g) => {
                              const active = form.watch("goal") === g;
                              return (
                                <button
                                  type="button"
                                  key={g}
                                  onClick={() => form.setValue("goal", g, { shouldValidate: true })}
                                  className={`text-left text-sm px-4 py-3 rounded-xl transition border ${
                                    active
                                      ? "bg-gradient-brand text-white border-transparent"
                                      : "glass border-white/5 hover:bg-white/10"
                                  }`}
                                >
                                  {g}
                                </button>
                              );
                            })}
                          </div>
                        </Field>
                        <Field label="Anything specific?" error={form.formState.errors.notes?.message}>
                          <textarea
                            rows={4}
                            {...form.register("notes")}
                            placeholder="Pages, funnels, or campaigns you want us to focus on…"
                            className="input-glass"
                          />
                        </Field>
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <Field label="Your name" error={form.formState.errors.name?.message}>
                          <input {...form.register("name")} className="input-glass" placeholder="Jane Doe" />
                        </Field>
                        <Field label="Work email" error={form.formState.errors.email?.message}>
                          <input
                            {...form.register("email")}
                            type="email"
                            className="input-glass"
                            placeholder="you@brand.com"
                          />
                        </Field>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-3 pt-2">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="px-5 py-3 rounded-xl glass hover:bg-white/10 text-sm flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={next}
                      className="ml-auto px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow flex items-center gap-2"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="ml-auto px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow flex items-center gap-2"
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                        </>
                      ) : (
                        <>Request free audit</>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
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