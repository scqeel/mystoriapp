import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatGHS } from "@/lib/format";
import { Check, Loader2, Sparkles, Store, TrendingUp } from "lucide-react";

export function BecomeAgent({ onClose }: { onClose: () => void }) {
  const { data: settings } = useSettings();
  const { isAgent, profile } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  const activate = async () => {
    setBusy(true);
    const { error, data } = await supabase.functions.invoke("paystack-initiate", {
      body: {
        purpose: "agent_activation",
        email: profile?.email,
        return_url: `${window.location.origin}/payment/callback`,
      },
    });
    setBusy(false);
    if (error || !data?.ok || !data?.authorization_url) {
      toast({ title: "Payment initialization failed", description: error?.message ?? data?.error, variant: "destructive" });
      return;
    }

    window.location.href = data.authorization_url;
  };

  if (isAgent) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
          <Check className="h-8 w-8 text-success" />
        </div>
        <p className="mt-4 text-lg font-semibold">You're already an agent</p>
        <Button onClick={() => { onClose(); nav("/agent"); }} className="mt-4 rounded-2xl gradient-primary">Open Agent Dashboard</Button>
      </div>
    );
  }

  const fee = settings?.agent_activation_fee ?? 50;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl gradient-soft p-6 border border-border/60">
        <Sparkles className="h-8 w-8 text-primary" />
        <h3 className="mt-3 text-xl font-semibold">Earn with OneGig</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Get your own data store. Set your prices. Profit on every sale.
        </p>
      </div>

      <div className="space-y-3">
        <Benefit icon={<Store className="h-5 w-5" />} title="Your own mini store" desc="A clean storefront link to share with customers." />
        <Benefit icon={<TrendingUp className="h-5 w-5" />} title="Set your own prices" desc="Profit auto-credited on every order." />
        <Benefit icon={<Sparkles className="h-5 w-5" />} title="Withdraw to MoMo" desc={`Cash out anytime above ${formatGHS(settings?.min_withdrawal ?? 50)}.`} />
      </div>

      <div className="rounded-3xl border border-border/60 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Activation fee (one-time)</p>
          <p className="text-2xl font-bold">{formatGHS(fee)}</p>
        </div>
        <Button
          onClick={activate}
          disabled={busy}
          className="h-14 rounded-2xl px-6 gradient-primary shadow-float"
        >
          {busy ? <Loader2 className="animate-spin" /> : "Pay & Activate"}
        </Button>
      </div>
    </div>
  );
}

function Benefit({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}