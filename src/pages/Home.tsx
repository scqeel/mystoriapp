import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Instant data delivery",
    description: "Buy and send mobile data in seconds with clean tracking and confirmations.",
    icon: Zap,
  },
  {
    title: "Reliable order tracking",
    description: "Monitor your order status live from pending to delivered.",
    icon: CheckCircle2,
  },
  {
    title: "Secure account access",
    description: "Sign in safely and keep your purchases, profile, and history in one place.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-6 pb-16 pt-10 md:px-10">
        <header className="flex items-center justify-between border-b border-border/50 pb-5">
          <Logo size="md" />
          <Button asChild variant="ghost" className="rounded-xl text-foreground">
            <Link to="/auth">Sign in</Link>
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 md:grid-cols-2">
          <div className="animate-fade-in space-y-6 text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Fast, simple, and secure
            </p>
            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Buy data quickly with a dashboard built for everyday use.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              OneGig helps you purchase data, track each order, and manage your account from one clean interface.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="h-12 rounded-xl px-6 text-sm font-semibold">
                <Link to="/auth">
                  Sign up
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-xl border-primary/40 bg-background/30 px-6 text-sm font-semibold text-foreground hover:bg-primary/10 hover:text-foreground">
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>
          </div>

          <div className="animate-fade-up rounded-3xl border border-border/60 bg-card/70 p-6 shadow-soft backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-foreground">What we do</h2>
            <div className="mt-5 space-y-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-primary/15 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="animate-fade-up rounded-3xl border border-primary/35 bg-primary/10 p-6 md:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Become an agent</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Start your own data store and earn on every sale.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your account, activate as an agent, and run your own branded storefront.
              </p>
            </div>
            <Button asChild className="h-12 rounded-xl px-6 text-sm font-semibold">
              <Link to="/auth?intent=agent">
                <BriefcaseBusiness className="h-4 w-4" />
                Become an agent
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
