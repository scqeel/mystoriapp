import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check, Copy, ExternalLink, Loader2, Package, Settings,
  Store, TrendingUp, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatGHS, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

type AgentTab = "store" | "transactions" | "withdrawals" | "settings";

const TABS: { label: string; value: AgentTab; icon: React.ReactNode }[] = [
  { label: "My Store", value: "store", icon: <Store className="h-4 w-4" /> },
  { label: "Transactions", value: "transactions", icon: <Package className="h-4 w-4" /> },
  { label: "Withdrawals", value: "withdrawals", icon: <Wallet className="h-4 w-4" /> },
  { label: "Settings", value: "settings", icon: <Settings className="h-4 w-4" /> },
];

export default function AgentDashboard() {
  const [tab, setTab] = useState<AgentTab>("store");
  const { user } = useAuth();
  const nav = useNavigate();

  const { data: agentProfile, isLoading } = useQuery({
    queryKey: ["my-agent-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("agent_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data as any;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!agentProfile) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white text-center">
        <Store className="h-12 w-12 text-muted-foreground/40" />
        <p className="font-medium text-foreground">No agent profile found.</p>
        <Button variant="outline" onClick={() => nav("/dashboard/agent")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Agent Dashboard</h1>
              <p className="text-xs text-muted-foreground">{agentProfile.store_name}</p>
            </div>
          </div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Back to homepage</Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-border bg-card p-2 shadow-soft">
            <nav className="space-y-1">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTab(t.value)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    tab === t.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          <main>
            {tab === "store" && <StoreSection agentProfile={agentProfile} userId={user?.id} />}
            {tab === "transactions" && <TransactionsSection agentId={agentProfile.id} />}
            {tab === "withdrawals" && <WithdrawalsSection userId={user?.id!} />}
            {tab === "settings" && <SettingsSection agentProfile={agentProfile} />}
          </main>
        </div>
      </div>
    </div>
  );
}

// --- Store --------------------------------------------------------------------

function StoreSection({ agentProfile, userId }: { agentProfile: any; userId?: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const storeUrl = `${window.location.origin}/store/${agentProfile.store_slug}`;
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { data: payload, isLoading } = useQuery({
    queryKey: ["agent-store-bundles", agentProfile.id],
    queryFn: async () => {
      const [{ data: networks }, { data: bundles }, { data: myPrices }] = await Promise.all([
        supabase.from("networks").select("id, name, code, logo_emoji").eq("active", true).order("sort_order"),
        supabase.from("bundles").select("id, network_id, size_label, size_mb, base_price").eq("active", true).order("sort_order"),
        supabase.from("agent_bundle_prices").select("bundle_id, sell_price, active").eq("agent_id", agentProfile.id),
      ]);
      const priceMap: Record<string, number> = {};
      (myPrices ?? []).forEach((r: any) => { if (r.active) priceMap[r.bundle_id] = Number(r.sell_price); });
      return { networks: networks ?? [], bundles: bundles ?? [], priceMap };
    },
  });

  const [prices, setPrices] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (payload?.priceMap) {
      const s: Record<string, string> = {};
      Object.entries(payload.priceMap).forEach(([k, v]) => { s[k] = String(v); });
      setPrices(s);
    }
  }, [payload?.priceMap]);

  const savePrices = async () => {
    setSaving(true);
    const rows = (payload?.bundles ?? [])
      .filter((b: any) => prices[b.id] && Number(prices[b.id]) > 0)
      .map((b: any) => ({ agent_id: agentProfile.id, bundle_id: b.id, sell_price: Number(prices[b.id]), active: true }));
    if (rows.length) {
      await supabase.from("agent_bundle_prices").upsert(rows as any, { onConflict: "agent_id,bundle_id" });
    }
    setSaving(false);
    toast({ title: "Prices saved" });
    qc.invalidateQueries({ queryKey: ["agent-store-bundles"] });
  };

  return (
    <div className="space-y-5">
      {/* Store link */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground">Store Link</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Share this link. Customers can buy without signing up.</p>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm font-mono text-muted-foreground break-all">
            {storeUrl}
          </div>
          <Button variant="outline" size="sm" className="shrink-0 rounded-xl" onClick={copyUrl}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <a href={storeUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border hover:bg-secondary/60">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Your Pricing</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Profit = your price minus base price</p>
          </div>
          <Button className="h-9 rounded-xl gradient-primary" disabled={saving} onClick={savePrices}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Prices"}
          </Button>
        </div>
        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="mt-5 space-y-4">
            {(payload?.networks ?? []).map((n: any) => {
              const networkBundles = (payload?.bundles ?? []).filter((b: any) => b.network_id === n.id);
              if (!networkBundles.length) return null;
              return (
                <div key={n.id} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-foreground">{n.logo_emoji} {n.name}</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4 font-medium">Bundle</th>
                          <th className="pb-2 pr-4 font-medium">Base</th>
                          <th className="pb-2 pr-4 font-medium">Your Price</th>
                          <th className="pb-2 font-medium">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {networkBundles.map((b: any) => {
                          const sell = Number(prices[b.id] ?? 0);
                          const profit = sell - Number(b.base_price);
                          return (
                            <tr key={b.id} className="border-b border-border/50 last:border-0">
                              <td className="py-2.5 pr-4 font-medium">{b.size_label}</td>
                              <td className="py-2.5 pr-4 text-muted-foreground">{formatGHS(b.base_price)}</td>
                              <td className="py-2.5 pr-4">
                                <Input
                                  type="number" min="0" step="0.5"
                                  className="h-8 w-24 rounded-lg text-sm"
                                  value={prices[b.id] ?? ""}
                                  placeholder={String(b.base_price)}
                                  onChange={(e) => setPrices((p) => ({ ...p, [b.id]: e.target.value }))}
                                />
                              </td>
                              <td className="py-2.5">
                                <span className={cn("text-xs font-medium", profit > 0 ? "text-green-600" : profit < 0 ? "text-destructive" : "text-muted-foreground")}>
                                  {profit !== 0 ? `${profit > 0 ? "+" : ""}${formatGHS(profit)}` : "-"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Status Badge -------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    delivered: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize", cls[status] ?? "bg-muted text-muted-foreground")}>
      {status}
    </span>
  );
}

// --- Transactions -------------------------------------------------------------

function TransactionsSection({ agentId }: { agentId: string }) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["agent-transactions", agentId],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, recipient_phone, status, sell_price, agent_profit, created_at, bundle:bundles(size_label, size_mb), network:networks(name, logo_emoji)")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-foreground">Transactions</h2>
      <p className="mb-5 text-sm text-muted-foreground">Orders placed through your store.</p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-2xl border border-border bg-white shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Recipient</th>
                  <th className="px-4 py-3 font-medium">Network</th>
                  <th className="px-4 py-3 font-medium">Bundle</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Profit</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {(orders as any[]).map((o) => (
                  <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{o.recipient_phone}</td>
                    <td className="px-4 py-3">{o.network?.logo_emoji} {o.network?.name}</td>
                    <td className="px-4 py-3">{o.bundle?.size_label}</td>
                    <td className="px-4 py-3 font-semibold">{formatGHS(o.sell_price)}</td>
                    <td className="px-4 py-3 font-medium text-green-600">+{formatGHS(o.agent_profit)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{timeAgo(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders?.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Withdrawals --------------------------------------------------------------

const MOMO_NETWORKS = ["MTN", "Telecel", "AirtelTigo"] as const;

function WithdrawalsSection({ userId }: { userId: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [momoName, setMomoName] = useState("");
  const [momoNetwork, setMomoNetwork] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: walletData, isLoading } = useQuery({
    queryKey: ["agent-wallet", userId],
    queryFn: async () => {
      const [balRes, earningsRes, withdrawalsRes] = await Promise.all([
        supabase.rpc("get_wallet_balance", { _user_id: userId }),
        supabase.from("wallet_transactions").select("amount").eq("user_id", userId).eq("type", "earning").eq("status", "completed"),
        supabase.from("withdrawals").select("id, amount, momo_number, momo_name, momo_network, status, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      ]);
      const balance = Number(balRes.data ?? 0);
      const totalRevenue = (earningsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      return { balance, totalRevenue, withdrawals: withdrawalsRes.data ?? [] };
    },
  });

  const requestWithdrawal = async () => {
    const amt = Number(amount);
    if (!amt || amt < 50) { toast({ title: "Minimum withdrawal is GHS 50", variant: "destructive" }); return; }
    if (!momoNumber || !momoName || !momoNetwork) { toast({ title: "Fill in all MoMo details", variant: "destructive" }); return; }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("request-withdrawal", { body: { amount: amt, momo_number: momoNumber, momo_name: momoName, momo_network: momoNetwork } });
    setBusy(false);
    if (error || !data?.ok) { toast({ title: "Withdrawal failed", description: data?.error || error?.message, variant: "destructive" }); return; }
    toast({ title: "Withdrawal requested!", description: "Processed within 24 hours." });
    setAmount(""); setMomoNumber(""); setMomoName(""); setMomoNetwork("");
    qc.invalidateQueries({ queryKey: ["agent-wallet"] });
  };

  return (
    <div className="space-y-5">
      {/* Balance */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Wallet className="h-4 w-4" /> Available Balance
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">{isLoading ? "..." : formatGHS(walletData?.balance ?? 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Ready to withdraw</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <TrendingUp className="h-4 w-4" /> Total Revenue
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">{isLoading ? "..." : formatGHS(walletData?.totalRevenue ?? 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Lifetime earnings</p>
        </div>
      </div>

      {/* Withdrawal form */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground">Request Withdrawal</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Minimum GHS 50. Processed within 24 hours.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Amount (GHS)</label>
            <Input type="number" min="50" className="mt-1 h-11" placeholder="e.g. 100" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">MoMo Network</label>
            <select value={momoNetwork} onChange={(e) => setMomoNetwork(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-foreground">
              <option value="">Select network</option>
              {MOMO_NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">MoMo Number</label>
            <Input type="tel" inputMode="tel" className="mt-1 h-11" placeholder="024 000 0000" value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Account Name</label>
            <Input className="mt-1 h-11" placeholder="Name on MoMo account" value={momoName} onChange={(e) => setMomoName(e.target.value)} />
          </div>
        </div>
        <Button className="mt-5 h-11 rounded-xl px-6 gradient-primary" disabled={busy} onClick={requestWithdrawal}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Withdrawal"}
        </Button>
      </div>

      {/* History */}
      {(walletData?.withdrawals?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <h3 className="mb-4 text-base font-semibold text-foreground">Withdrawal History</h3>
          <div className="space-y-2">
            {(walletData?.withdrawals as any[]).map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 p-3">
                <div>
                  <p className="font-semibold text-foreground">{formatGHS(w.amount)}</p>
                  <p className="text-xs text-muted-foreground">{w.momo_network} / {w.momo_number} / {w.momo_name}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={w.status} />
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(w.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Settings -----------------------------------------------------------------

function SettingsSection({ agentProfile }: { agentProfile: any }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    store_name: agentProfile.store_name ?? "",
    store_tagline: agentProfile.store_tagline ?? "",
    store_brand_color: agentProfile.store_brand_color ?? "#7c3aed",
    store_logo_url: agentProfile.store_logo_url ?? "",
    support_whatsapp: agentProfile.support_whatsapp ?? "",
    support_phone: agentProfile.support_phone ?? "",
  });
  const [saving, setSaving] = useState(false);

  const f = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("agent_profiles").update({
      store_name: form.store_name,
      store_tagline: form.store_tagline || null,
      store_brand_color: form.store_brand_color || null,
      store_logo_url: form.store_logo_url || null,
      support_whatsapp: form.support_whatsapp || null,
      support_phone: form.support_phone || null,
    } as any).eq("id", agentProfile.id);
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Store settings saved" });
    qc.invalidateQueries({ queryKey: ["my-agent-profile"] });
  };

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-foreground">Store Settings</h2>
      <p className="mb-6 text-sm text-muted-foreground">Customize how your public store looks.</p>
      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Store Name</label>
            <Input className="mt-1 h-11" value={form.store_name} onChange={(e) => f("store_name", e.target.value)} placeholder="My Data Store" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Tagline (optional)</label>
            <Input className="mt-1 h-11" value={form.store_tagline} onChange={(e) => f("store_tagline", e.target.value)} placeholder="Fast & affordable data bundles" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Logo URL</label>
            <Input className="mt-1 h-11" value={form.store_logo_url} onChange={(e) => f("store_logo_url", e.target.value)} placeholder="https://example.com/logo.png" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Brand Colour</label>
            <div className="mt-1 flex items-center gap-2">
              <input type="color" value={form.store_brand_color} onChange={(e) => f("store_brand_color", e.target.value)} className="h-11 w-11 cursor-pointer rounded-lg border border-border bg-white p-1" />
              <Input className="h-11 flex-1" value={form.store_brand_color} onChange={(e) => f("store_brand_color", e.target.value)} placeholder="#7c3aed" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">WhatsApp</label>
            <Input className="mt-1 h-11" value={form.support_whatsapp} onChange={(e) => f("support_whatsapp", e.target.value)} placeholder="e.g. 024 000 0000" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Support Phone</label>
            <Input className="mt-1 h-11" value={form.support_phone} onChange={(e) => f("support_phone", e.target.value)} placeholder="e.g. 024 000 0000" />
          </div>
        </div>
        <Button className="mt-6 h-11 rounded-xl px-6 gradient-primary" disabled={saving} onClick={save}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
