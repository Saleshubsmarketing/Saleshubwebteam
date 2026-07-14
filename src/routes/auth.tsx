import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SaleshubsWebOffice" },
      { name: "description", content: "Admin sign-in for the SaleshubsWebOffice lead dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const redirect = `${window.location.origin}/admin/leads`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirect },
        });
        if (error) throw error;
        toast.success("Account created. Check email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      nav({ to: "/admin/leads" });
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <PageHero eyebrow="Admin" title={<>Sign in</>} subtitle="Access the lead management dashboard." />
      <section className="pb-24 mx-auto max-w-md px-4">
        <form onSubmit={submit} className="glass-strong rounded-3xl p-8 space-y-4">
          <label className="block">
            <span className="text-xs text-muted-foreground mb-1.5 block">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-glass" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground mb-1.5 block">Password</span>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-glass" />
          </label>
          <button disabled={loading} className="w-full px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
          <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}>
            {mode === "signin" ? "Need an admin account? Create one" : "Have an account? Sign in"}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">
            First user to sign in becomes the admin. <Link to="/" className="underline">Back to site</Link>
          </p>
        </form>
      </section>
    </SiteLayout>
  );
}