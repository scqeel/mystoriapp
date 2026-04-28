import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Phone, Store } from "lucide-react";
import { BuyDataFlow } from "@/components/buy/BuyDataFlow";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AgentStorePage() {
  const { slug } = useParams<{ slug: string }>();
  const nav = useNavigate();

  const { data: agent, isLoading: loadingAgent, isError } = useQuery({
    queryKey: ["public-store", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await supabase
        .from("agent_profiles")
        .select("*")
        .eq("store_slug", slug!)
        .eq("activation_paid", true)
        .maybeSingle();
      return data as any;
    },
  });

  const { data: priceOverrides, isLoading: loadingPrices } = useQuery({
    queryKey: ["store-prices", agent?.id],
    enabled: !!agent?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("agent_bundle_prices")
        .select("bundle_id, sell_price")
        .eq("agent_id", agent!.id)
        .eq("active", true);
      const map: Record<string, number> = {};
      (data ?? []).forEach((r: any) => {
        map[r.bundle_id] = Number(r.sell_price);
      });
      return map;
    },
  });

  useEffect(() => {
    if (!loadingAgent && (isError || !agent)) {
      nav("/", { replace: true });
    }
  }, [loadingAgent, isError, agent, nav]);

  if (loadingAgent || loadingPrices || !agent) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const brandColor = agent.store_brand_color || "#f97316";

  return (
    <div className="min-h-dvh bg-background pb-24">
      {/* Store header */}
      <div
        className="border-b border-border/60 px-5 py-5"
        style={{ borderBottomColor: `${brandColor}30` }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-4">
          {agent.store_logo_url ? (
            <img
              src={agent.store_logo_url}
              alt={agent.store_name}
              className="h-12 w-12 rounded-2xl object-cover"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${brandColor}20` }}
            >
              <Store className="h-6 w-6" style={{ color: brandColor }} />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {agent.store_name}
            </h1>
            {agent.store_tagline && (
              <p className="text-sm text-muted-foreground">
                {agent.store_tagline}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Buy flow */}
      <div className="mx-auto max-w-lg px-5 pt-6">
        <BuyDataFlow
          agentSlug={slug}
          priceOverrides={priceOverrides}
          brandColor={brandColor}
        />
      </div>

      {/* Support footer */}
      {(agent.support_whatsapp || agent.support_phone) && (
        <div className="mx-auto mt-8 max-w-lg px-5">
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Need help?
            </p>
            <div className="flex flex-wrap gap-3">
              {agent.support_whatsapp && (
                <a
                  href={agent.support_whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              {agent.support_phone && (
                <a
                  href={`tel:${agent.support_phone}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-2 text-sm font-medium"
                >
                  <Phone className="h-4 w-4" />
                  {agent.support_phone}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
