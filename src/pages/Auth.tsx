import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Tab = "signin" | "signup";

const inputCls = "h-13 rounded-xl px-4 bg-card border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50 focus-visible:border-primary/60";

export default function AuthPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { session, loading } = useAuth();
  const { data: settings } = useSettings();

  const from = (loc.state as { from?: string } | null)?.from;
  const intent = searchParams.get("intent");

  const [tab, setTab] = useState<Tab>(intent === "agent" ? "signup" : "signin");
  const [busy, setBusy] = useState(false);

  // Sign-in fields
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // Sign-up fields
  const [suFullName, setSuFullName] = useState("");
  const [suUsername, setSuUsername] = useState("");
  const [suPhone, setSuPhone] = useState("");
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
    if (!suFullName || !suUsername || !suPhone || !suEmail || !suPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    const cleanedPhone = suPhone.replace(/\D/g, "");
    if (cleanedPhone.length < 9) {
      toast({ title: "Enter a valid phone number", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: suEmail.trim().toLowerCase(),
      password: suPassword,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: suFullName.trim(),
          username: suUsername.toLowerCase().trim(),
          phone: cleanedPhone,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created!", description: "Check your email to confirm your account." });
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="app-shell flex flex-col px-6 pt-12 pb-10">
        {/* Logo */}
        <div className="text-center animate-fade-in">
          <Logo size="lg" />
          <p className="mt-3 text-muted-foreground text-base">
            {settings?.platform_tagline ?? "Buy data in seconds ⚡"}
          </p>
          {intent === "agent" && (
            <p className="mt-3 inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Create an account to activate your agent store.
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex rounded-xl border border-border/60 bg-card p-1 gap-1 animate-fade-up">
          {(["signin", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
                tab === t
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Sign In */}
        {tab === "signin" && (
          <div className="mt-6 space-y-3 animate-fade-up">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground ml-1">Email address</label>
              <Input
                autoFocus
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={siEmail}
                onChange={(e) => setSiEmail(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground ml-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={siPassword}
                onChange={(e) => setSiPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSignIn()}
                className={inputCls}
              />
            </div>
            <Button
              onClick={doSignIn}
              disabled={busy}
              className="mt-2 w-full h-12 rounded-xl text-sm font-semibold gradient-primary shadow-float"
            >
              {busy ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign in"}
            </Button>
            <p className="text-center text-xs text-muted-foreground pt-1">
              Don't have an account?{" "}
              <button onClick={() => setTab("signup")} className="text-primary hover:text-primary/80 font-medium">
                Sign up
              </button>
            </p>
          </div>
        )}

        {/* Sign Up */}
        {tab === "signup" && (
          <div className="mt-6 space-y-3 animate-fade-up">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Full name</label>
                <Input
                  autoFocus
                  placeholder="Kwame Mensah"
                  value={suFullName}
                  onChange={(e) => setSuFullName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Username</label>
                <Input
                  placeholder="kwame123"
                  value={suUsername}
                  onChange={(e) => setSuUsername(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground ml-1">Phone number</label>
              <Input
                inputMode="tel"
                placeholder="024 123 4567"
                value={suPhone}
                onChange={(e) => setSuPhone(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground ml-1">Email address</label>
              <Input
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={suEmail}
                onChange={(e) => setSuEmail(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground ml-1">Password</label>
              <Input
                type="password"
                placeholder="Create a strong password"
                value={suPassword}
                onChange={(e) => setSuPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSignUp()}
                className={inputCls}
              />
            </div>
            <Button
              onClick={doSignUp}
              disabled={busy}
              className="mt-2 w-full h-12 rounded-xl text-sm font-semibold gradient-primary shadow-float"
            >
              {busy ? <Loader2 className="animate-spin h-4 w-4" /> : "Create account"}
            </Button>
            <p className="text-center text-xs text-muted-foreground pt-1">
              Already have an account?{" "}
              <button onClick={() => setTab("signin")} className="text-primary hover:text-primary/80 font-medium">
                Sign in
              </button>
            </p>
          </div>
        )}

        <p className="mt-auto pt-10 text-center text-xs text-muted-foreground">
          By continuing you agree to our terms · Lightning-fast data in Ghana
        </p>
        <p className="mt-3 text-center text-xs">
          <Link to="/" className="text-primary hover:text-primary/80">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}