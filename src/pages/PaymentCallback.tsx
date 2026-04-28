import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PaymentCallbackPage() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const reference = useMemo(
    () => searchParams.get("reference") || searchParams.get("trxref") || "",
    [searchParams]
  );

  useEffect(() => {
    const run = async () => {
      if (!reference) {
        toast({ title: "Payment reference missing", variant: "destructive" });
        nav("/dashboard", { replace: true });
        return;
      }

      const { data, error } = await supabase.functions.invoke("paystack-verify", {
        body: { reference },
      });

      if (error || !data?.ok) {
        toast({
          title: "Payment verification failed",
          description: data?.error || error?.message,
          variant: "destructive",
        });
        nav("/dashboard", { replace: true });
        return;
      }

      if (data.purpose === "agent_activation") {
        toast({ title: "Payment successful", description: "Your agent account is now active." });
        nav("/agent", { replace: true });
        return;
      }

      toast({ title: "Payment successful", description: "Your order has been processed." });
      nav("/dashboard/track", { replace: true });
    };

    run();
  }, [nav, reference, toast]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="rounded-2xl border border-border/60 bg-card/70 p-6 text-center shadow-soft backdrop-blur-sm">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Verifying payment, please wait...</p>
      </div>
    </div>
  );
}
