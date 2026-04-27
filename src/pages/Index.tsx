import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Package, Shield, Signal, Store, User as UserIcon, Wallet } from "lucide-react";
import { formatGHS, timeAgo } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { profile, isAdmin, isAgent, session } = useAuth();
  const nav = useNavigate();

  const { data: recent } = useQuery({
    queryKey: ["my-recent-orders", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, reference, status, sell_price, recipient_phone, created_at, bundle:bundles(size_label), network:networks(name, logo_emoji)")
        .eq("customer_user_id", session!.user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  if (!session) {
    nav("/auth", { replace: true });
    return null;
  }

  const greeting = profile?.full_name?.split(" ")[0] || profile?.username || "there";

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1360px] px-5 pt-6 md:px-8 xl:px-12">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hi, {greeting} 👋</p>
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/profile"
              className="h-11 w-11 rounded-2xl bg-card border border-border/60 shadow-soft flex items-center justify-center hover:scale-105 transition-transform"
            >
              <UserIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="rounded-3xl gradient-primary p-6 text-primary-foreground shadow-float relative overflow-hidden md:p-8 lg:col-span-8">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <p className="text-sm opacity-80">Ready to send data?</p>
              <h2 className="mt-1 text-3xl font-bold leading-tight md:text-4xl">Buy in seconds.</h2>
              <p className="mt-3 max-w-xl text-sm text-primary-foreground/90">
                Clean checkout, instant confirmation, and reliable delivery from one professional workspace.
              </p>
              <Button asChild className="mt-5 h-12 rounded-2xl bg-white text-primary hover:bg-white/95 shadow-soft px-6">
                <Link to="/dashboard/buy">
                  <Signal className="h-4 w-4 mr-1" /> Buy Data
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-4 lg:grid-cols-1">
            <QuickAction icon={<Signal />} label="Buy Data" to="/dashboard/buy" />
            <QuickAction icon={<Package />} label="Track Orders" to="/dashboard/track" />
            <QuickAction icon={<Briefcase />} label={isAgent ? "My Store" : "Become Agent"} to={isAgent ? "/agent" : "/dashboard/agent"} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <StatCard title="Recent Orders" value={String(recent?.length ?? 0)} helper="Last 5 transactions" />
          <StatCard title="Account Type" value={isAgent ? "Agent" : "Customer"} helper={isAgent ? "You can manage your store" : "Upgrade anytime"} />
          <StatCard title="Security" value="Protected" helper="Signed in session active" />
        </div>

        {/* Become Agent card (if not yet) */}
        {!isAgent && (
          <Link
            to="/dashboard/agent"
            className="mt-5 w-full rounded-3xl gradient-soft p-5 border border-border/60 flex items-center gap-4 text-left hover:shadow-soft transition-all"
          >
            <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center text-white shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Earn with OneGig 💸</p>
              <p className="text-sm text-muted-foreground">Open your store. Set prices. Profit on every sale.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        )}

        {/* Recent orders */}
        <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="text-sm text-muted-foreground mb-2 ml-1">Recent activity</p>
            {recent && recent.length > 0 ? (
              <div className="space-y-2">
                {recent.map((o: any) => (
                  <div key={o.id} className="rounded-2xl bg-card border border-border/60 p-4 flex items-center gap-3 shadow-soft">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-lg">
                      {o.network?.logo_emoji || "📶"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{o.bundle?.size_label} · {o.network?.name}</p>
                      <p className="text-xs text-muted-foreground">to {o.recipient_phone} · {timeAgo(o.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatGHS(o.sell_price)}</p>
                      <StatusPill status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                No orders yet. Tap "Buy Data" above ⚡
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Account</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{profile?.full_name || profile?.username || "My profile"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Manage profile, store, and session actions from one place.</p>
              <div className="mt-4 space-y-2">
                <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                  <Link to="/dashboard/profile"><User asIcon className="mr-2 h-4 w-4" /> Profile & Settings</Link>
                </Button>
                {isAgent && (
                  <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                    <Link to="/agent"><Store className="mr-2 h-4 w-4" /> Open Agent Store</Link>
                  </Button>
                )}
                {isAdmin && (
                  <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                    <Link to="/admin"><Shield className="mr-2 h-4 w-4" /> Admin Console</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

function QuickAction({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  return (
    <Link
      to={to}
      className="rounded-2xl bg-card border border-border/60 p-4 flex flex-col items-center gap-2 shadow-soft hover:scale-[1.03] hover:shadow-float transition-all active:scale-95"
    >
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

function StatCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </div>
  );
}

function User({ className }: { className?: string }) {
  return <UserIcon className={className} />;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    delivered: "bg-success/10 text-success",
    processing: "bg-warning/10 text-warning",
    pending: "bg-muted text-muted-foreground",
    failed: "bg-destructive/10 text-destructive",
    refunded: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status] ?? "bg-muted"}`}>
      {status}
    </span>
  );
}

export default Index;
