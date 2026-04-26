import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PlaceOrderBody {
  recipient_phone: string;
  customer_phone?: string;
  bundle_id: string;
  agent_slug?: string | null;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/**
 * Stub data delivery adapter.
 * Plug your real Ghana data API (Hubtel / Sika / etc.) here.
 * Return { ok: true } to mark order as delivered.
 */
async function deliverData(_args: {
  recipient: string;
  network_code: string;
  size_mb: number;
}): Promise<{ ok: boolean; provider_ref?: string; message?: string }> {
  // Simulate near-instant success
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true, provider_ref: `STUB-${Date.now()}` };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as PlaceOrderBody;
    if (!body?.recipient_phone || !body?.bundle_id) {
      return json({ error: "recipient_phone and bundle_id are required" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Resolve caller (optional)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userPhone: string | null = null;
    if (authHeader) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: ud } = await userClient.auth.getUser();
      userId = ud.user?.id ?? null;
      if (userId) {
        const { data: prof } = await admin.from("profiles").select("phone").eq("id", userId).maybeSingle();
        userPhone = prof?.phone ?? null;
      }
    }

    // Bundle lookup
    const { data: bundle, error: bErr } = await admin
      .from("bundles")
      .select("id, base_price, size_mb, network_id, networks:networks(code)")
      .eq("id", body.bundle_id)
      .maybeSingle();
    if (bErr || !bundle) return json({ error: "Bundle not found" }, 404);

    // Agent + agent price
    let agentId: string | null = null;
    let sellPrice = Number(bundle.base_price);
    let agentProfit = 0;
    let source: "direct" | "agent_store" = "direct";

    if (body.agent_slug) {
      const { data: agent } = await admin
        .from("agent_profiles")
        .select("id, user_id, activation_paid")
        .eq("store_slug", body.agent_slug)
        .maybeSingle();
      if (agent && agent.activation_paid) {
        agentId = agent.id;
        source = "agent_store";
        const { data: ap } = await admin
          .from("agent_bundle_prices")
          .select("sell_price")
          .eq("agent_id", agent.id)
          .eq("bundle_id", bundle.id)
          .maybeSingle();
        if (ap) {
          sellPrice = Number(ap.sell_price);
          agentProfit = Math.max(0, sellPrice - Number(bundle.base_price));
        }
      }
    }

    const customerPhone = body.customer_phone || userPhone || body.recipient_phone;

    // Insert order
    const { data: order, error: oErr } = await admin
      .from("orders")
      .insert({
        customer_user_id: userId,
        customer_phone: customerPhone,
        recipient_phone: body.recipient_phone,
        network_id: bundle.network_id,
        bundle_id: bundle.id,
        agent_id: agentId,
        source,
        base_price: bundle.base_price,
        sell_price: sellPrice,
        agent_profit: agentProfit,
        status: "processing",
        payment_status: "paid", // mock payment
        payment_reference: `MOCK-${Date.now()}`,
      })
      .select("*")
      .single();
    if (oErr || !order) return json({ error: oErr?.message ?? "Order create failed" }, 500);

    // Deliver via stub adapter
    const networkCode = (bundle.networks as any)?.code ?? "MTN";
    const delivery = await deliverData({
      recipient: body.recipient_phone,
      network_code: networkCode,
      size_mb: bundle.size_mb,
    });

    const finalStatus = delivery.ok ? "delivered" : "failed";
    await admin
      .from("orders")
      .update({
        status: finalStatus,
        notes: delivery.message ?? null,
      })
      .eq("id", order.id);

    // Credit agent profit
    if (delivery.ok && agentId && agentProfit > 0) {
      const { data: agentRow } = await admin
        .from("agent_profiles")
        .select("user_id")
        .eq("id", agentId)
        .maybeSingle();
      if (agentRow?.user_id) {
        await admin.from("wallet_transactions").insert({
          user_id: agentRow.user_id,
          type: "earning",
          amount: agentProfit,
          status: "completed",
          related_order_id: order.id,
          description: `Profit from order ${order.reference}`,
        });
      }
    }

    return json({
      ok: delivery.ok,
      order: { ...order, status: finalStatus },
    });
  } catch (e: any) {
    console.error("place-order error", e);
    return json({ error: e?.message ?? "Internal error" }, 500);
  }
});