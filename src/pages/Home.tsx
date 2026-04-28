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
    <main className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute -top-36 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-6 pb-14 pt-8 md:px-8 xl:px-10">
        <header className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 px-4 py-3 backdrop-blur-sm md:px-6">
          <Logo size="md" />
          <Button asChild variant="ghost" className="rounded-xl text-foreground">
            <Link to="/auth?tab=signin">Sign in</Link>
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-12">
          <div className="animate-fade-in space-y-6 text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Enterprise-grade Data Operations
            </p>
            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl xl:text-6xl">
              One sleek command center for data sales and operations.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Modern dashboards for customers, admins, and agents. Process orders, monitor activity, and scale your storefront from one fast interface.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="h-12 rounded-xl px-6 text-sm font-semibold shadow-float">
                <Link to="/auth?tab=signup">
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-xl border-primary/40 bg-background/30 px-6 text-sm font-semibold text-foreground hover:bg-primary/10 hover:text-foreground">
                <Link to="/auth?tab=signin">Sign in</Link>
              </Button>
            </div>
          </div>

          <div className="animate-fade-up lg:col-span-7 xl:col-span-6">
            <div className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-float backdrop-blur-sm md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Live Risk & Activity Snapshot</p>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">Realtime</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Total Orders", value: "2,481" },
                  { label: "Success Rate", value: "99.1%" },
                  { label: "Agents", value: "412" },
                  { label: "Revenue", value: "GHS 74k" },
                ].map((m) => (
                  <div key={m.label} className="rounded-2xl border border-border/60 bg-background/60 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{m.label}</p>
                    <p className="mt-1 text-lg font-semibold">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="h-36 rounded-xl bg-gradient-to-r from-primary/10 via-cyan-400/5 to-primary/10" />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
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
                          <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
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
