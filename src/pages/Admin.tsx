import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, CheckCircle2, Cog, DollarSign, Loader2, RefreshCw, Settings, ShoppingCart, Trash2, UserCog, Users } from "lucide-react";
import { formatGB } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatGHS, timeAgo } from "@/lib/format";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

type Tab = "overview" | "users" | "orders" | "withdrawals" | "pricing" | "settings";

type Profile = {
  id: string;
  full_name: string;
  username: string | null;
  email: string | null;
  phone: string | null;
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const loc = useLocation();

  const sidebarItems = [
    { label: "Overview", value: "overview", icon: <Users className="h-4 w-4" /> },
    { label: "Users", value: "users", icon: <UserCog className="h-4 w-4" /> },
    { label: "Orders", value: "orders", icon: <ShoppingCart className="h-4 w-4" /> },
    { label: "Withdrawals", value: "withdrawals", icon: <DollarSign className="h-4 w-4" /> },
    { label: "Pricing", value: "pricing", icon: <Cog className="h-4 w-4" /> },
    { label: "Site Settings", value: "settings", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Monitor platform operations, users, transactions, and settings."
      badge="Admin Console"
      sidebarItems={sidebarItems.map((item) => ({
        label: item.label,
        icon: item.icon,
        active: tab === (item.value as Tab),
        onClick: () => setTab(item.value as Tab),
      }))}
      topActions={
        <a href="/dashboard" className="rounded-xl border border-border/60 bg-card px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          Back to Dashboard
        </a>
      }
    >
      {tab === "overview" && <OverviewSection />}
      {tab === "users" && <UsersSection />}
      {tab === "orders" && <OrdersSection />}
      {tab === "withdrawals" && <WithdrawalsSection />}
      {tab === "pricing" && <PricingSection />}
      {tab === "settings" && <SiteSettingsSection />}
    </DashboardLayout>
  );
}

function AdminTab({
  label,
  value,
  tab,
  setTab,
}: {
  label: string;
  value: Tab;
  tab: Tab;
  setTab: (v: Tab) => void;
}) {
  return (
    <button
      onClick={() => setTab(value)}
      className={[
        "w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors",
        tab === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function OverviewSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [profilesRes, agentsRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "agent"),
        supabase.from("orders").select("id, sell_price, created_at"),
      ]);

      const totalUsers = profilesRes.count ?? 0;
      const totalAgents = agentsRes.count ?? 0;
      const orders = ordersRes.data ?? [];
      const totalOrders = orders.length;
      const revenue = orders.reduce((sum, o: any) => sum + Number(o.sell_price ?? 0), 0);

      const last30 = new Date();
      last30.setDate(last30.getDate() - 30);
      const revenue30d = orders
        .filter((o: any) => new Date(o.created_at) >= last30)
        .reduce((sum, o: any) => sum + Number(o.sell_price ?? 0), 0);

      return { totalUsers, totalAgents, totalOrders, revenue, revenue30d };
    },
  });

  if (isLoading) return <LoadingCard text="Loading overview..." />;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric title="Total Users" value={String(data?.totalUsers ?? 0)} icon={<Users className="h-4 w-4" />} />
      <Metric title="Total Agents" value={String(data?.totalAgents ?? 0)} icon={<UserCog className="h-4 w-4" />} />
      <Metric title="Total Orders" value={String(data?.totalOrders ?? 0)} icon={<CheckCircle2 className="h-4 w-4" />} />
      <Metric title="Revenue (All Time)" value={formatGHS(data?.revenue ?? 0)} icon={<Settings className="h-4 w-4" />} helper={`30 days: ${formatGHS(data?.revenue30d ?? 0)}`} />
    </div>
  );
}

function UsersSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, username, email, phone").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      const rolesMap = new Map<string, string[]>();
      (rolesRes.data ?? []).forEach((r: any) => {
        const prev = rolesMap.get(r.user_id) ?? [];
        rolesMap.set(r.user_id, [...prev, r.role]);
      });

      return (profilesRes.data ?? []).map((p: any) => ({
        ...p,
        roles: rolesMap.get(p.id) ?? ["user"],
      }));
    },
  });

  const removeUser = async (userId: string) => {
    setBusyId(userId);
    const { error } = await supabase.functions.invoke("admin-delete-user", { body: { user_id: userId } });
    setBusyId(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "User deleted" });
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  const makeAgent = async (userId: string) => {
    setBusyId(userId);
    const { error } = await supabase.functions.invoke("admin-convert-agent", { body: { user_id: userId } });
    setBusyId(null);
    if (error) {
      toast({ title: "Conversion failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "User converted to agent" });
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  if (isLoading) return <LoadingCard text="Loading users..." />;

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
      <h2 className="text-xl font-semibold">Users</h2>
      <div className="mt-4 space-y-3">
        {data?.map((u: any) => (
          <div key={u.id} className="rounded-2xl border border-border/60 bg-background/50 p-4 md:flex md:items-center md:justify-between">
            <div>
              <p className="font-medium">{u.full_name || u.username || "Unnamed"}</p>
              <p className="text-sm text-muted-foreground">{u.email || "No email"} · {u.phone || "No phone"}</p>
              <p className="mt-1 text-xs text-muted-foreground">Roles: {u.roles.join(", ")}</p>
            </div>
            <div className="mt-3 flex gap-2 md:mt-0">
              {!u.roles.includes("agent") && (
                <Button
                  variant="outline"
                  className="h-9 rounded-lg"
                  disabled={busyId === u.id}
                  onClick={() => makeAgent(u.id)}
                >
                  {busyId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Convert to agent"}
                </Button>
              )}
              <Button
                variant="ghost"
                className="h-9 rounded-lg text-destructive hover:text-destructive"
                disabled={busyId === u.id}
                onClick={() => removeUser(u.id)}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Delete user
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    delivered: "bg-green-500/15 text-green-400",
    pending: "bg-yellow-500/15 text-yellow-400",
    processing: "bg-blue-500/15 text-blue-400",
    failed: "bg-red-500/15 text-red-400",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cls[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function OrdersSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [retryId, setRetryId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, reference, bundle_id, source, status, sell_price, created_at, customer_user_id, recipient_phone, bundle:bundles(size_label), network:networks(name, logo_emoji), agent:agent_profiles(store_name)")
        .order("created_at", { ascending: false })
        .limit(200);

      const userIds = [...new Set((orders ?? []).map((o: any) => o.customer_user_id).filter(Boolean))] as string[];
      let profiles: Profile[] = [];
      if (userIds.length) {
        const { data: p } = await supabase.from("profiles").select("id, full_name, username, email, phone").in("id", userIds);
        profiles = (p ?? []) as Profile[];
      }
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      return (orders ?? []).map((o: any) => ({
        ...o,
        customer: o.customer_user_id ? profileMap.get(o.customer_user_id) ?? null : null,
      }));
    },
  });

  const retryOrder = async (order: any) => {
    if (!order.bundle_id || !order.recipient_phone) return;
    setRetryId(order.id);
    const { error } = await supabase.functions.invoke("place-order", {
      body: { recipient_phone: order.recipient_phone, bundle_id: order.bundle_id },
    });
    setRetryId(null);
    if (error) {
      toast({ title: "Retry failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Order retried", description: "A new delivery attempt has been placed." });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  if (isLoading) return <LoadingCard text="Loading orders..." />;

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
      <h2 className="text-xl font-semibold">Orders</h2>
      <p className="mt-1 text-sm text-muted-foreground">Direct users, agent dashboard, and agent store orders.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
              <th className="pb-2.5 pr-4 font-medium">Network / Bundle</th>
              <th className="pb-2.5 pr-4 font-medium">Recipient</th>
              <th className="pb-2.5 pr-4 font-medium">Customer</th>
              <th className="pb-2.5 pr-4 font-medium">Source</th>
              <th className="pb-2.5 pr-4 font-medium">Price</th>
              <th className="pb-2.5 pr-4 font-medium">Status</th>
              <th className="pb-2.5 pr-4 font-medium">Date</th>
              <th className="pb-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((o: any) => (
              <tr key={o.id} className="border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors">
                <td className="py-3 pr-4">
                  <span className="font-medium">{o.network?.logo_emoji || "📦"} {o.network?.name}</span>
                  <span className="ml-1 text-xs text-muted-foreground">{o.bundle?.size_label}</span>
                </td>
                <td className="py-3 pr-4 font-mono text-xs">{o.recipient_phone}</td>
                <td className="py-3 pr-4">{o.customer?.full_name || o.customer?.email || <span className="text-muted-foreground">Guest</span>}</td>
                <td className="py-3 pr-4 text-xs capitalize text-muted-foreground">{o.source?.replace("_", " ")}</td>
                <td className="py-3 pr-4 font-semibold">{formatGHS(o.sell_price)}</td>
                <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                <td className="py-3 pr-4 text-xs text-muted-foreground whitespace-nowrap">{timeAgo(o.created_at)}</td>
                <td className="py-3">
                  {o.status === "failed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-lg text-xs"
                      disabled={retryId === o.id}
                      onClick={() => retryOrder(o)}
                    >
                      {retryId === o.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><RefreshCw className="mr-1 h-3 w-3" />Retry</>}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length && <p className="mt-6 text-center text-sm text-muted-foreground">No orders yet.</p>}
      </div>
    </div>
  );
}

function WithdrawalsSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => {
      const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select("id, user_id, amount, momo_name, momo_number, momo_network, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      const userIds = [...new Set((withdrawals ?? []).map((w: any) => w.user_id).filter(Boolean))] as string[];
      let profiles: Profile[] = [];
      if (userIds.length) {
        const { data: p } = await supabase.from("profiles").select("id, full_name, username, email, phone").in("id", userIds);
        profiles = (p ?? []) as Profile[];
      }
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      const balances = await Promise.all(
        userIds.map(async (uid) => {
          const { data: bal } = await supabase.rpc("get_wallet_balance", { _user_id: uid });
          return [uid, Number(bal ?? 0)] as const;
        })
      );
      const balMap = new Map(balances);

      return (withdrawals ?? []).map((w: any) => ({
        ...w,
        profile: profileMap.get(w.user_id) ?? null,
        balance: balMap.get(w.user_id) ?? 0,
      }));
    },
  });

  const confirmWithdrawal = async (withdrawalId: string) => {
    setBusyId(withdrawalId);
    const { error } = await supabase.functions.invoke("process-withdrawal", {
      body: { withdrawal_id: withdrawalId, action: "mark_paid" },
    });
    setBusyId(null);
    if (error) {
      toast({ title: "Confirmation failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Withdrawal confirmed" });
    qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
  };

  if (isLoading) return <LoadingCard text="Loading withdrawals..." />;

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
      <h2 className="text-xl font-semibold">Withdrawals</h2>
      <div className="mt-4 space-y-3">
        {data?.map((w: any) => (
          <div key={w.id} className="rounded-2xl border border-border/60 bg-background/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{w.profile?.full_name || w.profile?.email || "Unknown Agent"}</p>
              <p className="font-semibold">{formatGHS(w.amount)}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Available balance: {formatGHS(w.balance)}</p>
            <p className="mt-1 text-xs text-muted-foreground">MoMo: {w.momo_network} · {w.momo_number} · {w.momo_name}</p>
            <p className="mt-1 text-xs text-muted-foreground">Status: {w.status} · {timeAgo(w.created_at)}</p>
            <Button
              className="mt-3 h-9 rounded-lg"
              disabled={busyId === w.id || w.status === "paid"}
              onClick={() => confirmWithdrawal(w.id)}
            >
              {busyId === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Withdrawal"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ network_id: "", size_label: "", size_gb: "", base_price: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activationFee, setActivationFee] = useState("50");

  const { data: payload, isLoading } = useQuery({
    queryKey: ["admin-pricing"],
    queryFn: async () => {
      const [{ data: networks }, { data: bundles }, { data: feeRow }] = await Promise.all([
        supabase.from("networks").select("id, name, code").order("sort_order"),
        supabase.from("bundles").select("id, network_id, size_label, size_mb, base_price, active").order("sort_order"),
        supabase.from("app_settings").select("value").eq("key", "agent_activation_fee").maybeSingle(),
      ]);
      return { networks: networks ?? [], bundles: bundles ?? [], activationFee: Number(feeRow?.value ?? 50) };
    },
  });

  useEffect(() => {
    if (payload?.activationFee != null) setActivationFee(String(payload.activationFee));
  }, [payload?.activationFee]);

  const saveBundle = async () => {
    if (!form.network_id || !form.size_label || !form.size_gb || !form.base_price) return;
    const row = {
      network_id: form.network_id,
      size_label: form.size_label,
      size_mb: Math.round(Number(form.size_gb) * 1000),
      base_price: Number(form.base_price),
      sort_order: 0,
      active: true,
    };
    if (editingId) {
      const { error } = await supabase.from("bundles").update(row as any).eq("id", editingId);
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Bundle updated" });
    } else {
      const { error } = await supabase.from("bundles").insert(row as any);
      if (error) {
        toast({ title: "Create failed", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Bundle created" });
    }
    setForm({ network_id: "", size_label: "", size_gb: "", base_price: "" });
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["admin-pricing"] });
  };

  const removeBundle = async (id: string) => {
    const { error } = await supabase
      .from("bundles")
      .update({ active: false })
      .eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.from("agent_bundle_prices").update({ active: false }).eq("bundle_id", id);
    toast({ title: "Package removed" });
    qc.invalidateQueries({ queryKey: ["admin-pricing"] });
  };

  const saveActivationFee = async () => {
    const { error } = await supabase.from("app_settings").upsert({ key: "agent_activation_fee", value: Number(activationFee) });
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Activation fee updated" });
  };

  if (isLoading) return <LoadingCard text="Loading pricing..." />;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
        <h2 className="text-xl font-semibold">Add / Edit Packages</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select
            value={form.network_id}
            onChange={(e) => setForm((p) => ({ ...p, network_id: e.target.value }))}
            className="h-11 rounded-xl border border-border/60 bg-background px-3 text-sm"
          >
            <option value="">Network</option>
            {payload?.networks.map((n: any) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
          <Input placeholder="Package label" value={form.size_label} onChange={(e) => setForm((p) => ({ ...p, size_label: e.target.value }))} className="h-11" />
          <Input placeholder="Size (GB)" type="number" step="0.5" min="0" value={form.size_gb} onChange={(e) => setForm((p) => ({ ...p, size_gb: e.target.value }))} className="h-11" />
          <Input placeholder="Price (GHS)" value={form.base_price} onChange={(e) => setForm((p) => ({ ...p, base_price: e.target.value }))} className="h-11" />
        </div>
        <Button className="mt-3 h-10 rounded-lg" onClick={saveBundle}>{editingId ? "Update package" : "Add package"}</Button>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
        <h3 className="text-lg font-semibold">Packages</h3>
        <div className="mt-3 space-y-4">
          {(payload?.networks ?? []).map((n: any) => {
            const items = (payload?.bundles ?? []).filter((b: any) => b.network_id === n.id && b.active);
            if (!items.length) return null;

            return (
              <div key={n.id} className="rounded-2xl border border-border/60 bg-background/40 p-3">
                <h4 className="mb-2 text-sm font-semibold">{n.name}</h4>
                <div className="space-y-2">
                  {items.map((b: any) => (
                    <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/60 p-3">
                      <div>
                        <p className="font-medium">{b.size_label} ({formatGB(b.size_mb)})</p>
                        <p className="text-xs text-muted-foreground">Price: {formatGHS(Number(b.base_price))}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="h-8 rounded-lg"
                          onClick={() => {
                            setEditingId(b.id);
                            setForm({
                              network_id: b.network_id,
                              size_label: b.size_label,
                              size_gb: String(b.size_mb / 1000),
                              base_price: String(b.base_price),
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button variant="ghost" className="h-8 rounded-lg text-destructive hover:text-destructive" onClick={() => removeBundle(b.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
        <h3 className="text-lg font-semibold">Agent Activation Fee</h3>
        <div className="mt-3 flex gap-2">
          <Input value={activationFee} onChange={(e) => setActivationFee(e.target.value)} className="h-11 max-w-[220px]" />
          <Button className="h-11 rounded-lg" onClick={saveActivationFee}>Save fee</Button>
        </div>
      </div>
    </div>
  );
}

function SiteSettingsSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [supportPhone, setSupportPhone] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [notice, setNotice] = useState("");
  useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data: rows } = await supabase.from("app_settings").select("key, value");
      const map: Record<string, any> = {};
      (rows ?? []).forEach((r: any) => (map[r.key] = r.value));

      setSupportPhone(String(map.support_phone ?? ""));
      setSupportEmail(String(map.support_email ?? ""));
      setWhatsappLink(String(map.whatsapp_group_link ?? ""));
      setNotice(String(map.popup_notice ?? ""));
      return true;
    },
    staleTime: 60_000,
  });

  const saveSettings = async () => {
    const rows = [
      { key: "support_phone", value: supportPhone },
      { key: "support_email", value: supportEmail },
      { key: "whatsapp_group_link", value: whatsappLink },
      { key: "popup_notice", value: notice },
    ];

    const { error } = await supabase.from("app_settings").upsert(rows as any);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Site settings updated" });
    qc.invalidateQueries({ queryKey: ["app_settings"] });
  };

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
      <h2 className="text-xl font-semibold">Site Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">Popup notifications and support channels.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="Support contact" className="h-11" />
        <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="Support email" className="h-11" />
        <Input value={whatsappLink} onChange={(e) => setWhatsappLink(e.target.value)} placeholder="WhatsApp group link" className="h-11 md:col-span-2" />
      </div>

      <div className="mt-4">
        <label className="text-xs text-muted-foreground">Popup notice for users</label>
        <Input value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="Type notification to show on dashboard" className="mt-1 h-11" />
      </div>

      <Button className="mt-4 h-10 rounded-lg" onClick={saveSettings}>
        <BellRing className="mr-2 h-4 w-4" /> Save Site Settings
      </Button>
    </div>
  );
}

function Metric({ title, value, icon, helper }: { title: string; value: string; icon: React.ReactNode; helper?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">{icon}{title}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function LoadingCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-8 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
