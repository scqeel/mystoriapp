import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNetworks, useBundles, BundleRow, NetworkRow } from "@/hooks/useNetworksAndBundles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatGHS } from "@/lib/format";
import { Confetti } from "@/components/Confetti";
import { CheckCircle2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Phase = "select" | "processing" | "success" | "error";

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
  const [email, setEmail] = useState(profile?.email || "");
  const [phase, setPhase] = useState<Phase>("select");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

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
    setCheckoutOpen(false);
  };

  const buy = async () => {
    if (!bundle || !phone || phone.replace(/\D/g, "").length < 9) {
      toast({ title: "Enter recipient phone", variant: "destructive" });
      return;
    }
    if (!email || !email.includes("@")) {
      toast({ title: "Enter a valid email", description: "Paystack requires an email for checkout.", variant: "destructive" });
      return;
    }

    setCheckoutOpen(false);
    setPhase("processing");
    const { data, error } = await supabase.functions.invoke("paystack-initiate", {
      body: {
        purpose: "order",
        recipient_phone: phone.replace(/\D/g, ""),
        bundle_id: bundle.id,
        agent_slug: agentSlug ?? null,
        email: email.trim().toLowerCase(),
        return_url: `${window.location.origin}/payment/callback`,
      },
    });

    if (error || !data?.ok || !data?.authorization_url) {
      setErrorMsg(data?.error || error?.message || "Payment initialization failed");
      setPhase("error");
      return;
    }

    window.location.href = data.authorization_url;
  };

  const accent = brandColor ?? "hsl(var(--primary))";

  const networkCode = String(network?.code ?? "").toUpperCase();
  const cardTheme =
    networkCode === "MTN"
      ? {
          idle: "border-yellow-300/70 bg-yellow-100/70 text-yellow-900 hover:bg-yellow-100",
          active: "border-yellow-500 bg-yellow-400/80 text-yellow-950 shadow-float",
          badge: "bg-yellow-500 text-yellow-950",
        }
      : networkCode === "TELECEL"
      ? {
          idle: "border-red-300/70 bg-red-100/70 text-red-900 hover:bg-red-100",
          active: "border-red-500 bg-red-500/85 text-white shadow-float",
          badge: "bg-red-600 text-white",
        }
      : {
          idle: "border-blue-300/70 bg-blue-100/70 text-blue-900 hover:bg-blue-100",
          active: "border-blue-500 bg-blue-500/85 text-white shadow-float",
          badge: "bg-blue-600 text-white",
        };

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
        <p className="mt-6 text-lg font-medium">Redirecting to Paystack...</p>
        <p className="text-sm text-muted-foreground">Do not close this window.</p>
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
        <p className="text-sm text-muted-foreground mb-2 ml-1">Select package</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {bundles.map((b) => {
            const active = bundle?.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setBundle(b);
                  setCheckoutOpen(true);
                }}
                className={cn(
                  "rounded-2xl border px-4 py-4 text-left transition-all",
                  active ? cardTheme.active : cardTheme.idle
                )}
              >
                <div className="text-[11px] uppercase tracking-wide opacity-80">{network?.name}</div>
                <div className="mt-1 text-lg font-bold">{b.size_label}</div>
                <div className="mt-1 text-sm font-semibold">{formatGHS(priceFor(b))}</div>
              </button>
            );
          })}
          {bundles.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground py-4">No bundles available</div>
          )}
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="w-[94vw] max-w-md rounded-2xl border-border/60 p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-left">Confirm Purchase</DialogTitle>
            <DialogDescription className="text-left">
              Review amount, enter recipient number, then continue to Paystack.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{bundle?.size_label || "Package"}</p>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", cardTheme.badge)}>{network?.name}</span>
            </div>
            <p className="mt-2 text-2xl font-bold" style={{ color: accent }}>
              {bundle ? formatGHS(finalPrice) : "—"}
            </p>
          </div>

          <div>
            <p className="mb-2 ml-1 text-sm text-muted-foreground">Recipient phone</p>
            <Input
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="024 123 4567"
              className="h-12 rounded-xl border-border/60"
            />
          </div>

          <div>
            <p className="mb-2 ml-1 text-sm text-muted-foreground">Payment email</p>
            <Input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 rounded-xl border-border/60"
            />
          </div>

          <Button
            onClick={buy}
            disabled={!bundle || phone.replace(/\D/g, "").length < 9 || !email}
            className="h-12 rounded-xl text-sm font-semibold"
          >
            <Zap className="mr-1 h-4 w-4" /> Proceed to Pay
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}