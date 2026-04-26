import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { phoneToEmail } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { ArrowRight, Loader2 } from "lucide-react";

type Step = "phone" | "login" | "signup";

export default function AuthPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { session, loading } = useAuth();
  const { data: settings } = useSettings();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const from = (loc.state as { from?: string } | null)?.from;
  const intent = searchParams.get("intent");

  useEffect(() => {
    if (!loading && session) nav(from || "/dashboard", { replace: true });
  }, [session, loading, nav, from]);

  const checkPhone = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 9) {
      toast({ title: "Enter a valid phone", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { data } = await supabase.from("profiles").select("id").eq("phone", cleaned).maybeSingle();
    setBusy(false);
    setStep(data ? "login" : "signup");
  };

  const doLogin = async () => {
    if (!password) return;
    setBusy(true);
    const cleaned = phone.replace(/\D/g, "");
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(cleaned),
      password,
    });
    setBusy(false);
    if (error) toast({ title: "Wrong password", description: error.message, variant: "destructive" });
  };

  const doSignup = async () => {
    if (!password || !fullName || !username) {
      toast({ title: "Fill in all fields", variant: "destructive" });
      return;
    }
    setBusy(true);
    const cleaned = phone.replace(/\D/g, "");
    const { error } = await supabase.auth.signUp({
      email: email || phoneToEmail(cleaned),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { phone: cleaned, full_name: fullName, username: username.toLowerCase().trim() },
      },
    });
    setBusy(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="relative min-h-dvh">
      {/* Floating gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-primary-glow/20 blur-3xl" />

      <div className="app-shell flex flex-col px-6 pt-16 pb-10">
        <div className="text-center animate-fade-in">
          <Logo size="lg" />
          <p className="mt-4 text-muted-foreground text-lg">
            {settings?.platform_tagline ?? "Buy data in seconds ⚡"}
          </p>
          {intent === "agent" && (
            <p className="mt-3 inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Sign in or create an account to activate your agent store.
            </p>
          )}
        </div>

        <div className="mt-12 space-y-4 animate-fade-up">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground ml-1">Phone number</label>
            <Input
              autoFocus
              inputMode="tel"
              placeholder="024 123 4567"
              value={phone}
              onChange={(e) => {
                if (step !== "phone") setStep("phone");
                setPhone(e.target.value);
                setPassword("");
              }}
              className="h-16 rounded-2xl text-xl px-5 bg-card shadow-soft border-border/60 focus-visible:ring-primary/40"
            />
          </div>

          {step === "phone" && (
            <Button
              onClick={checkPhone}
              disabled={busy || phone.length < 9}
              className="w-full h-14 rounded-2xl text-base gradient-primary hover:opacity-95 shadow-float"
            >
              {busy ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight className="ml-1" /></>}
            </Button>
          )}

          {step === "login" && (
            <div className="space-y-3 animate-slide-down">
              <p className="text-sm text-muted-foreground ml-1">Welcome back 👋 enter your password</p>
              <Input
                autoFocus
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
                className="h-16 rounded-2xl text-xl px-5 bg-card shadow-soft border-border/60"
              />
              <Button
                onClick={doLogin}
                disabled={busy || !password}
                className="w-full h-14 rounded-2xl text-base gradient-primary shadow-float"
              >
                {busy ? <Loader2 className="animate-spin" /> : "Sign in"}
              </Button>
            </div>
          )}

          {step === "signup" && (
            <div className="space-y-3 animate-slide-down">
              <p className="text-sm text-muted-foreground ml-1">New here ✨ let's set you up</p>
              <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-14 rounded-2xl px-5 bg-card shadow-soft" />
              <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="h-14 rounded-2xl px-5 bg-card shadow-soft" />
              <Input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-2xl px-5 bg-card shadow-soft" />
              <Input type="password" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl px-5 bg-card shadow-soft" />
              <Button
                onClick={doSignup}
                disabled={busy}
                className="w-full h-14 rounded-2xl text-base gradient-primary shadow-float"
              >
                {busy ? <Loader2 className="animate-spin" /> : "Create account"}
              </Button>
            </div>
          )}
        </div>

        <p className="mt-auto pt-12 text-center text-xs text-muted-foreground">
          By continuing you agree to our terms · Lightning-fast data in Ghana
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="text-primary hover:text-primary/80">
            Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}