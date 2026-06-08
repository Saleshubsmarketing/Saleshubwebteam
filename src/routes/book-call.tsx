import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Calendar, Loader2, Clock, Video } from "lucide-react";
import {
  bookCallSchema,
  type BookCallValues,
  revenueBands,
} from "@/lib/lead-schemas";

export const Route = createFileRoute("/book-call")({
  head: () => ({
    meta: [
      { title: "Book a Strategy Call | SaleshubsWebTeam" },
      {
        name: "description",
        content:
          "Book a free 30-minute strategy session with a senior Shopify growth strategist.",
      },
    ],
  }),
  component: BookPage,
});

const SLOTS = [
  "Mon 10:00",
  "Mon 14:00",
  "Tue 09:30",
  "Tue 16:00",
  "Wed 11:00",
  "Wed 15:30",
  "Thu 10:30",
  "Thu 17:00",
  "Fri 09:00",
];

function BookPage() {
  const [sent, setSent] = useState(false);

  const form = useForm<BookCallValues>({
    resolver: zodResolver(bookCallSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      store: "",
      revenue: revenueBands[1],
      slot: "",
      goal: "",
    },
  });

  const selectedSlot = form.watch("slot");

  const onSubmit = form.handleSubmit(async (values) => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Call reserved", {
      description: `${values.slot} — confirmation sent to ${values.email}.`,
    });
    setSent(true);
  });

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Strategy call"
        title={
          <>
            Book a free <span className="text-gradient-brand">30-min</span> strategy session.
          </>
        }
        subtitle="A senior strategist will map the three highest-leverage growth moves for your Shopify brand."
      />
      <section className="pb-24 mx-auto max-w-6xl px-4 grid md:grid-cols-5 gap-5">
        <aside className="md:col-span-2 space-y-4">
          <div className="glass rounded-3xl p-7 space-y-4">
            <Calendar className="w-6 h-6 text-[var(--brand-cyan)]" />
            <h3 className="text-xl font-semibold">What to expect</h3>
            {[
              "Deep audit of your store, funnel and acquisition",
              "Three highest-leverage growth moves",
              "Honest take on whether we're the right partner",
              "Zero sales pressure — promise.",
            ].map((p) => (
              <div key={p} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-[var(--brand-mint)] mt-0.5 shrink-0" />
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-5 flex items-center gap-3 text-xs text-muted-foreground">
            <Clock className="w-4 h-4 text-[var(--brand-cyan)]" /> 30 minutes · No prep needed
          </div>
          <div className="glass rounded-2xl p-5 flex items-center gap-3 text-xs text-muted-foreground">
            <Video className="w-4 h-4 text-[var(--brand-cyan)]" /> Google Meet — link sent on confirm
          </div>
        </aside>

        <div className="md:col-span-3 glass-strong rounded-3xl p-8">
          {sent ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-12 h-12 text-[var(--brand-mint)] mx-auto" />
              <h3 className="mt-5 text-2xl font-semibold">You're booked</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Calendar invite is on its way.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Pick a time slot</p>
                <div className="grid grid-cols-3 gap-2">
                  {SLOTS.map((s) => {
                    const active = selectedSlot === s;
                    return (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        key={s}
                        onClick={() =>
                          form.setValue("slot", s, { shouldValidate: true })
                        }
                        className={`rounded-lg py-2.5 text-sm transition border ${
                          active
                            ? "bg-gradient-brand text-white border-transparent"
                            : "glass border-white/5 hover:bg-white/10"
                        }`}
                      >
                        {s}
                      </motion.button>
                    );
                  })}
                </div>
                {form.formState.errors.slot && (
                  <span className="text-xs text-red-400 mt-2 block">
                    {form.formState.errors.slot.message}
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Name" error={form.formState.errors.name?.message}>
                  <input {...form.register("name")} className="input-glass" placeholder="Jane Doe" />
                </Field>
                <Field label="Email" error={form.formState.errors.email?.message}>
                  <input
                    type="email"
                    {...form.register("email")}
                    className="input-glass"
                    placeholder="you@brand.com"
                  />
                </Field>
              </div>
              <Field label="Shopify store URL" error={form.formState.errors.store?.message}>
                <input
                  {...form.register("store")}
                  className="input-glass"
                  placeholder="https://yourstore.com"
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
              <Field label="What do you want to walk away with? (optional)" error={form.formState.errors.goal?.message}>
                <textarea rows={3} {...form.register("goal")} className="input-glass" />
              </Field>

              <button
                disabled={form.formState.isSubmitting}
                className="w-full px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow flex items-center justify-center gap-2"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Reserving…
                  </>
                ) : (
                  <>Reserve slot</>
                )}
              </button>
            </form>
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