import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { BottomSheet } from "@/components/BottomSheet";
import { BuyDataFlow } from "@/components/buy/BuyDataFlow";
import { TrackOrder } from "@/components/buy/TrackOrder";
import { BecomeAgent } from "@/components/buy/BecomeAgent";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut, Package, Shield, Signal, Store, User as UserIcon, Wallet, ChevronRight } from "lucide-react";
import { formatGHS, timeAgo } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Sheet = null | "buy" | "track" | "agent" | "profile";

const Index = () => {
  const { profile, isAdmin, isAgent, signOut, session } = useAuth();
  const { data: settings } = useSettings();
  const nav = useNavigate();
  const [sheet, setSheet] = useState<Sheet>(null);

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
      <div className="px-5 pt-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hi, {greeting} 👋</p>
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSheet("profile")}
              className="h-11 w-11 rounded-2xl bg-card border border-border/60 shadow-soft flex items-center justify-center hover:scale-105 transition-transform"
            >
              <UserIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Hero buy card */}
        <div className="mt-6 rounded-3xl gradient-primary p-6 text-primary-foreground shadow-float relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-sm opacity-80">Ready to send data?</p>
            <h2 className="text-3xl font-bold mt-1 leading-tight">Buy in seconds.</h2>
            <Button
              onClick={() => setSheet("buy")}
              className="mt-4 h-12 rounded-2xl bg-white text-primary hover:bg-white/95 shadow-soft px-6"
            >
              <Signal className="h-4 w-4 mr-1" /> Buy Data
            </Button>
          </div>
        </div>

        {/* Quick action bar */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <QuickAction icon={<Signal />} label="Buy Data" onClick={() => setSheet("buy")} />
          <QuickAction icon={<Package />} label="Track" onClick={() => setSheet("track")} />
          <QuickAction icon={<Briefcase />} label={isAgent ? "My Store" : "Become Agent"} onClick={() => isAgent ? nav("/agent") : setSheet("agent")} />
        </div>

        {/* Become Agent card (if not yet) */}
        {!isAgent && (
          <button
            onClick={() => setSheet("agent")}
            className="mt-5 w-full rounded-3xl gradient-soft p-5 border border-border/60 flex items-center gap-4 text-left hover:shadow-soft transition-all"
          >
            <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center text-white shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Earn with OneGig 💸</p>
              <p className="text-sm text-muted-foreground">Open your store. Set prices. Profit on every sale.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        )}

        {/* Recent orders */}
        <div className="mt-7">
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

        {isAdmin && (
          <Link
            to="/admin"
            className="mt-5 flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-medium">Admin Console</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}
      </div>

      <BottomSheet open={sheet === "buy"} onOpenChange={(v) => setSheet(v ? "buy" : null)} title="Buy Data" size="lg">
        <BuyDataFlow onSuccess={() => setSheet(null)} />
      </BottomSheet>
      <BottomSheet open={sheet === "track"} onOpenChange={(v) => setSheet(v ? "track" : null)} title="Track Order" size="lg">
        <TrackOrder />
      </BottomSheet>
      <BottomSheet open={sheet === "agent"} onOpenChange={(v) => setSheet(v ? "agent" : null)} title="Earn with OneGig" size="lg">
        <BecomeAgent onClose={() => setSheet(null)} />
      </BottomSheet>
      <BottomSheet open={sheet === "profile"} onOpenChange={(v) => setSheet(v ? "profile" : null)} title="Profile" size="md">
        <div className="space-y-4">
          <div className="rounded-2xl bg-card p-5 border border-border/60">
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-medium">{profile?.full_name || "—"}</p>
            <p className="mt-3 text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{profile?.phone || "—"}</p>
            {profile?.email && (
              <>
                <p className="mt-3 text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </>
            )}
          </div>
          {isAgent && (
            <Button asChild variant="outline" className="w-full h-12 rounded-2xl">
              <Link to="/agent"><Store className="mr-2 h-4 w-4" /> Open Agent Store</Link>
            </Button>
          )}
          {isAdmin && (
            <Button asChild variant="outline" className="w-full h-12 rounded-2xl">
              <Link to="/admin"><Shield className="mr-2 h-4 w-4" /> Admin Console</Link>
            </Button>
          )}
          <Button onClick={() => signOut().then(() => nav("/auth"))} variant="ghost" className="w-full h-12 rounded-2xl text-destructive hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
          {settings?.support_phone && (
            <p className="text-xs text-center text-muted-foreground">Support: {settings.support_phone}</p>
          )}
        </div>
      </BottomSheet>
    </AppShell>
  );
};

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl bg-card border border-border/60 p-4 flex flex-col items-center gap-2 shadow-soft hover:scale-[1.03] hover:shadow-float transition-all active:scale-95"
    >
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
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
