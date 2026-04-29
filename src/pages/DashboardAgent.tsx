import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, CheckCircle2, Shield, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BecomeAgent } from "@/components/buy/BecomeAgent";

export default function DashboardAgentPage() {
  const { isAgent } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (isAgent) nav("/agent", { replace: true });
  }, [isAgent, nav]);

  return (
    <div className="min-h-dvh bg-background px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Activate Your Agent Account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Read the benefits below and complete activation to open your store.</p>
          </div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Back to homepage</Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft lg:col-span-5">
            <p className="text-xs uppercase tracking-wide text-primary">Why activate</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">Everything you need to run a reseller store</h2>
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3">
                <Wallet className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Profit on each order</p>
                  <p className="text-xs text-muted-foreground">Set your own sell prices and keep the margin.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3">
                <BriefcaseBusiness className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Your own public store link</p>
                  <p className="text-xs text-muted-foreground">Share your link so customers can buy data directly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3">
                <Shield className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Withdraw securely</p>
                  <p className="text-xs text-muted-foreground">Track earnings and request MoMo withdrawals from one dashboard.</p>
                </div>
              </div>
            </div>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Activation is required before your store goes live.
            </p>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft lg:col-span-7 md:p-7">
            <h3 className="text-lg font-semibold text-foreground">Complete Activation</h3>
            <p className="mt-1 text-sm text-muted-foreground">Make payment to activate your agent account now.</p>
            <div className="mt-5">
              <BecomeAgent onClose={() => {}} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
