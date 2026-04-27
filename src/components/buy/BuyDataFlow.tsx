import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNetworks, useBundles, BundleRow, NetworkRow } from "@/hooks/useNetworksAndBundles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatGHS } from "@/lib/format";
import { Confetti } from "@/components/Confetti";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Phase = "select" | "confirm" | "processing" | "success" | "error";

interface Props {
  /** When provided, this is an agent storefront purchase. */
  agentSlug?: string;
  /** Override prices (agent prices). Map of bundle_id -> price */
  priceOverrides?: Record<string, number>;
  /** Optional default phone */
  defaultPhone?: string;
  /** Brand color for accents */
  brandColor?: string;
  onSuccess?: () => void;
}

export function BuyDataFlow({ agentSlug, priceOverrides, defaultPhone, brandColor, onSuccess }: Props) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { data: networks = [] } = useNetworks();
  const [network, setNetwork] = useState<NetworkRow | null>(null);
  const { data: bundles = [] } = useBundles(network?.id ?? null);
  const [bundle, setBundle] = useState<BundleRow | null>(null);
  const [phone, setPhone] = useState(defaultPhone || profile?.phone || "");
  const [phase, setPhase] = useState<Phase>("select");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  useEffect(() => {
    if (!network && networks.length) setNetwork(networks[0]);
  }, [networks, network]);

  const priceFor = (b: BundleRow) =>
    priceOverrides && priceOverrides[b.id] != null ? priceOverrides[b.id] : Number(b.user_price ?? b.base_price);

  const finalPrice = bundle ? priceFor(bundle) : 0;

  const reset = () => {
    setBundle(null);
    setPhase("select");
    setOrderRef(null);
    setErrorMsg(null);
  };

  const buy = async () => {
    if (!bundle || !phone || phone.replace(/\D/g, "").length < 9) {
      toast({ title: "Enter recipient phone", variant: "destructive" });
      return;
    }
    setPhase("processing");
    const { data, error } = await supabase.functions.invoke("place-order", {
      body: {
        recipient_phone: phone.replace(/\D/g, ""),
        bundle_id: bundle.id,
        agent_slug: agentSlug ?? null,
      },
    });
    if (error || !data?.ok) {
      setErrorMsg(data?.error || error?.message || "Order failed");
      setPhase("error");
      return;
    }
    setOrderRef(data?.order?.reference ?? null);
    setPhase("success");
    onSuccess?.();
  };

  const accent = brandColor ?? "hsl(var(--primary))";

  if (phase === "success") {
    return (
      <div className="text-center py-6 animate-scale-in relative">
        <Confetti />
        <div className="mx-auto h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
        </div>
        <h3 className="mt-5 text-2xl font-semibold">Data sent successfully 🎉</h3>
        <p className="mt-2 text-muted-foreground">{bundle?.size_label} delivered to {phone}</p>
        {orderRef && <p className="mt-1 text-xs text-muted-foreground">Ref: {orderRef}</p>}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 rounded-2xl" onClick={reset}>Buy Again</Button>
          <Button className="h-12 rounded-2xl gradient-primary" onClick={() => onSuccess?.()}>Done</Button>
        </div>
      </div>
    );
  }

  if (phase === "processing") {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="mx-auto h-24 w-24 rounded-full gradient-primary animate-float-pulse flex items-center justify-center shadow-glow">
          <Zap className="h-10 w-10 text-white" />
        </div>
        <p className="mt-6 text-lg font-medium">Sending data...</p>
        <p className="text-sm text-muted-foreground">Hold tight, almost there</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="text-center py-8">
        <p className="text-destructive font-medium">{errorMsg}</p>
        <Button className="mt-4 rounded-2xl" variant="outline" onClick={() => setPhase("select")}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Networks */}
      <div>
        <p className="text-sm text-muted-foreground mb-2 ml-1">Network</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {networks.map((n) => {
            const active = network?.id === n.id;
            return (
              <button
                key={n.id}
                onClick={() => { setNetwork(n); setBundle(null); }}
                className={cn(
                  "shrink-0 rounded-full px-5 h-12 text-sm font-medium border transition-all",
                  active
                    ? "bg-foreground text-background border-foreground shadow-soft scale-105"
                    : "bg-card border-border/60 hover:border-foreground/30"
                )}
              >
                <span className="mr-1.5">{n.logo_emoji}</span>{n.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bundles */}
      <div>
        <p className="text-sm text-muted-foreground mb-2 ml-1">Bundle</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {bundles.map((b) => {
            const active = bundle?.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setBundle(b)}
                className={cn(
                  "shrink-0 rounded-2xl border transition-all px-4 py-3 min-w-[88px] text-center",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-float scale-105"
                    : "bg-card border-border/60 hover:border-primary/40"
                )}
              >
                <div className="text-base font-semibold">{b.size_label}</div>
                <div className={cn("text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {formatGHS(priceFor(b))}
                </div>
              </button>
            );
          })}
          {bundles.length === 0 && (
            <div className="text-sm text-muted-foreground py-4">No bundles available</div>
          )}
        </div>
      </div>

      {/* Phone */}
      <div>
        <p className="text-sm text-muted-foreground mb-2 ml-1">Recipient phone</p>
        <Input
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="024 123 4567"
          className="h-14 rounded-2xl px-5 bg-card border-border/60 text-lg"
        />
      </div>

      {/* Price + buy */}
      <div className="rounded-3xl p-5 gradient-soft border border-border/60">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Final Price</p>
            <p className="text-3xl font-bold tracking-tight" style={{ color: accent }}>
              {bundle ? formatGHS(finalPrice) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Includes fees</p>
          </div>
          <Button
            onClick={buy}
            disabled={!bundle || phone.length < 9}
            className="h-14 rounded-2xl px-6 text-base gradient-primary shadow-float disabled:opacity-50"
          >
            <Zap className="mr-1 h-4 w-4" /> Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}