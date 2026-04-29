import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { Loader2 } from "lucide-react";

const field = "h-12 rounded-xl px-4 bg-card/80 border border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50 focus-visible:border-primary/60";

export default function AuthPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { session, loading } = useAuth();
  const { data: settings } = useSettings();

  const from = (loc.state as { from?: string } | null)?.from;
  const tabParam = searchParams.get("tab");
  const intent = searchParams.get("intent");

  // Derive view from URL — signup if tab=signup or intent=agent, else signin
  const isSignUp = tabParam === "signup" || intent === "agent";

  const switchTo = (t: "signin" | "signup") => setSearchParams({ tab: t }, { replace: true });

  const [busy, setBusy] = useState(false);

  // Sign-in fields
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // Sign-up fields
  const [suFullName, setSuFullName] = useState("");
  const [suUsername, setSuUsername] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");

  useEffect(() => {
    if (!loading && session) nav(from || "/dashboard", { replace: true });
  }, [session, loading, nav, from]);

  const doSignIn = async () => {
    if (!siEmail || !siPassword) {
      toast({ title: "Enter your email and password", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: siEmail.trim().toLowerCase(),
      password: siPassword,
    });
    setBusy(false);
    if (error) toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
  };

  const doSignUp = async () => {
    if (!suFullName || !suUsername || !suEmail || !suPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const normalizedEmail = suEmail.trim().toLowerCase();

    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: suPassword,
        options: {
          data: {
            full_name: suFullName.trim(),
            username: suUsername.toLowerCase().trim(),
          },
        },
      });

      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        return;
      }

      // If Supabase returned a session directly, we're signed in — navigate now.
      if (data.session) {
        toast({ title: "Account created", description: "You are now signed in." });
        nav(from || "/dashboard", { replace: true });
        return;
      }

      // No session yet — auto sign in.
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: suPassword,
      });

      if (signInErr) {
        toast({ title: "Account created", description: "Please sign in to continue.", variant: "default" });
      } else {
        toast({ title: "Account created", description: "You are now signed in." });
        nav(from || "/dashboard", { replace: true });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unexpected error. Please try again.";
      toast({ title: "Sign up failed", description: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-6 md:px-8 lg:py-8">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-[1300px] overflow-hidden rounded-3xl border border-border/60 bg-card/55 shadow-float backdrop-blur-sm lg:grid-cols-12">
        <section className="relative hidden border-r border-border/60 bg-background/35 p-8 lg:col-span-5 lg:block xl:p-10">
          <Logo size="lg" />
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            {settings?.platform_tagline ?? "Operational dashboards for high-speed data commerce."}
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Realtime Activity</p>
              <p className="mt-1 text-2xl font-semibold">1,204 orders</p>
              <p className="mt-1 text-xs text-muted-foreground">Monitored across customer, admin, and agent views.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Availability</p>
              <p className="mt-1 text-2xl font-semibold">99.9%</p>
              <p className="mt-1 text-xs text-muted-foreground">Reliable flows optimized for fast checkout and tracking.</p>
            </div>
          </div>
        </section>

        <section className="p-6 md:p-8 lg:col-span-7 xl:p-10">
          <div className="mx-auto w-full max-w-[540px]">
            <div className="mb-7 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Secure Access</p>
              <Link to="/" className="text-xs text-primary hover:text-primary/80">Back to homepage</Link>
            </div>

            {!isSignUp && (
              <div className="animate-fade-up">
                <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
                <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to your dashboard</p>

                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="ml-1 text-xs font-medium text-muted-foreground">Email address</label>
                    <Input autoFocus type="email" inputMode="email" placeholder="you@example.com" value={siEmail} onChange={(e) => setSiEmail(e.target.value)} className={field} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="ml-1 text-xs font-medium text-muted-foreground">Password</label>
                    <Input type="password" placeholder="••••••••" value={siPassword} onChange={(e) => setSiPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSignIn()} className={field} />
                  </div>
                  <Button onClick={doSignIn} disabled={busy} className="h-12 w-full rounded-xl text-sm font-semibold gradient-primary shadow-float">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                  </Button>
                </div>

                <p className="mt-5 text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button onClick={() => switchTo("signup")} className="font-semibold text-primary hover:text-primary/80">Create one</button>
                </p>
              </div>
            )}

            {isSignUp && (
              <div className="animate-fade-up">
                <h2 className="text-2xl font-semibold text-foreground">Create your account</h2>
                <p className="mt-1 text-sm text-muted-foreground">Fill your details to unlock the full workspace</p>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="ml-1 text-xs font-medium text-muted-foreground">Full name</label>
                      <Input autoFocus placeholder="Kwame Mensah" value={suFullName} onChange={(e) => setSuFullName(e.target.value)} className={field} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="ml-1 text-xs font-medium text-muted-foreground">Username</label>
                      <Input placeholder="kwame123" value={suUsername} onChange={(e) => setSuUsername(e.target.value)} className={field} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="ml-1 text-xs font-medium text-muted-foreground">Email address</label>
                    <Input type="email" inputMode="email" placeholder="you@example.com" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} className={field} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="ml-1 text-xs font-medium text-muted-foreground">Password</label>
                    <Input type="password" placeholder="Create a strong password" value={suPassword} onChange={(e) => setSuPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSignUp()} className={field} />
                  </div>
                  <Button onClick={doSignUp} disabled={busy} className="h-12 w-full rounded-xl text-sm font-semibold gradient-primary shadow-float">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                  </Button>
                </div>

                <p className="mt-5 text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => switchTo("signin")} className="font-semibold text-primary hover:text-primary/80">Sign in</button>
                </p>
              </div>
            )}

            <p className="mt-8 text-xs text-muted-foreground">By continuing you agree to our terms and privacy policy.</p>
          </div>
        </section>
      </div>
    </div>
  );
}