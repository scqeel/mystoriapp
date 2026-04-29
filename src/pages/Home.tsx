import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CheckCircle, Menu, Package, Search, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 md:px-8">
          <Logo size="md" />
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/track" className="inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm text-muted-foreground hover:text-foreground">
              <Search className="h-3.5 w-3.5" /> Track order
            </Link>
            <Link to="/auth?tab=signin" className="inline-flex h-9 items-center rounded-xl px-4 text-sm text-muted-foreground hover:text-foreground">
              Agent sign in
            </Link>
            <Button asChild className="h-9 rounded-xl px-5 text-sm font-semibold gradient-primary shadow-float">
              <Link to="/buy">Buy Data Now</Link>
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="sr-only">Navigation</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                <SheetClose asChild>
                  <Button asChild className="h-11 w-full rounded-xl gradient-primary font-semibold">
                    <Link to="/buy">Buy Data Now</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline" className="h-11 w-full rounded-xl">
                    <Link to="/track"><Search className="mr-2 h-4 w-4" />Track Order</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="h-11 w-full rounded-xl text-muted-foreground">
                    <Link to="/auth?tab=signin">Agent Sign In</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-20 text-center md:px-8 md:pt-24">
        <span className="mb-5 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          Ghana's fast data bundle service
        </span>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
          Buy mobile data instantly.{" "}
          <span className="gradient-text">No account needed.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Choose your network, pick a bundle, and pay with MoMo or card. Delivered in seconds and no sign-up required.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base font-semibold gradient-primary shadow-float">
            <Link to="/buy">Buy Data Now <ArrowRight className="ml-1 h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 rounded-xl px-8 text-base font-semibold">
            <Link to="/track"><Search className="mr-2 h-4 w-4" /> Track My Order</Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {["No account needed", "Instant delivery", "Secure Paystack checkout", "All major networks"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />{t}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/50 py-16">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground">How it works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Zap, step: "1", title: "Choose your bundle", desc: "Select a network and the data bundle that fits your needs." },
              { icon: ShieldCheck, step: "2", title: "Pay securely", desc: "Complete payment via MoMo or card through Paystack." },
              { icon: Package, step: "3", title: "Receive instantly", desc: "Data is delivered to your number within seconds." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">Step {step}</p>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent CTA */}
      <section className="mx-auto max-w-5xl px-5 py-16 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-primary/20 bg-primary/5 p-7 md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">For resellers</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Earn on every data sale.</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Create an agent account, set your own prices, and share your store link. Profit on every customer order.
            </p>
          </div>
          <Button asChild className="shrink-0 h-12 rounded-xl px-7 text-sm font-semibold gradient-primary shadow-float">
            <Link to="/auth?intent=agent">
              <BriefcaseBusiness className="mr-2 h-4 w-4" />Become an Agent
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-white py-8 text-center text-xs text-muted-foreground">
        <p>Copyright {new Date().getFullYear()} OneGig. Fast, affordable mobile data for Ghana.</p>
        <div className="mt-3 flex items-center justify-center gap-5">
          <Link to="/buy" className="hover:text-foreground">Buy Data</Link>
          <Link to="/track" className="hover:text-foreground">Track Order</Link>
          <Link to="/auth?tab=signin" className="hover:text-foreground">Agent Login</Link>
        </div>
      </footer>
    </main>
  );
}
