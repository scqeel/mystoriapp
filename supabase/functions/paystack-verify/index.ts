import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function deliverData(_args: {
  recipient: string;
  network_code: string;
  size_mb: number;
}): Promise<{ ok: boolean; provider_ref?: string; message?: string }> {
  // Replace this stub with your real delivery provider integration.
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true, provider_ref: `STUB-${Date.now()}` };
}

async function activateAgent(admin: ReturnType<typeof createClient>, userId: string) {
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, username")
    .eq("id", userId)
    .maybeSingle();

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 40) || "store";

  const baseSlug = slugify(profile?.username || profile?.full_name || `agent-${userId.slice(0, 6)}`);
  let slug = baseSlug;
  let n = 0;
  while (true) {
    const { data: exists } = await admin.from("agent_profiles").select("id").eq("store_slug", slug).maybeSingle();
    if (!exists) break;
    n++;
    slug = `${baseSlug}-${n}`;
    if (n > 50) break;
  }

  const { data: agent, error: aErr } = await admin
    .from("agent_profiles")
    .upsert(
      {
        user_id: userId,
        store_slug: slug,
        store_name: `${profile?.full_name || "My"} Store`,
        activation_paid: true,
        activation_paid_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("id")
    .single();

  if (aErr) throw aErr;

  await admin.from("user_roles").upsert({ user_id: userId, role: "agent" }, { onConflict: "user_id,role" });

  return agent?.id;
}

async function fulfillOrder(admin: ReturnType<typeof createClient>, payment: any) {
  const payload = payment.payload ?? {};
  const bundleId = String(payload.bundle_id ?? "");
  const recipient = String(payload.recipient_phone ?? "");
  const agentSlug = payload.agent_slug ? String(payload.agent_slug) : null;
  const customerUserId = payment.user_id ?? null;

  if (!bundleId || !recipient) throw new Error("Invalid order payment payload");

  const { data: bundle, error: bErr } = await admin
    .from("bundles")
    .select("id, base_price, user_price, size_mb, network_id, networks:networks(code)")
    .eq("id", bundleId)
    .maybeSingle();

  if (bErr || !bundle) throw new Error("Bundle not found");

  let agentId: string | null = null;
  let sellPrice = Number(bundle.user_price ?? bundle.base_price);
  let agentProfit = 0;
  let source: "direct" | "agent_store" = "direct";

  if (agentSlug) {
    const { data: agent } = await admin
      .from("agent_profiles")
      .select("id, user_id, activation_paid")
      .eq("store_slug", agentSlug)
      .maybeSingle();

    if (agent?.activation_paid) {
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

  let customerPhone = recipient;
  if (customerUserId) {
    const { data: prof } = await admin.from("profiles").select("phone").eq("id", customerUserId).maybeSingle();
    customerPhone = prof?.phone ?? recipient;
  }

  const { data: order, error: oErr } = await admin
    .from("orders")
    .insert({
      customer_user_id: customerUserId,
      customer_phone: customerPhone,
      recipient_phone: recipient,
      network_id: bundle.network_id,
      bundle_id: bundle.id,
      agent_id: agentId,
      source,
      base_price: bundle.base_price,
      sell_price: sellPrice,
      agent_profit: agentProfit,
      status: "processing",
      payment_status: "paid",
      payment_reference: payment.reference,
    })
    .select("*")
    .single();

  if (oErr || !order) throw new Error(oErr?.message ?? "Order create failed");

  const networkCode = (bundle.networks as any)?.code ?? "MTN";
  const delivery = await deliverData({ recipient, network_code: networkCode, size_mb: bundle.size_mb });

  const finalStatus = delivery.ok ? "delivered" : "failed";
  await admin
    .from("orders")
    .update({ status: finalStatus, notes: delivery.message ?? null })
    .eq("id", order.id);

  if (delivery.ok && agentId && agentProfit > 0) {
    const { data: agentRow } = await admin.from("agent_profiles").select("user_id").eq("id", agentId).maybeSingle();
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

  return order.id;
}

async function verifyAndProcess(reference: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!paystackSecret) throw new Error("Missing PAYSTACK_SECRET_KEY");

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: payment } = await admin.from("payments").select("*").eq("reference", reference).maybeSingle();
  if (!payment) throw new Error("Payment record not found");

  if (payment.status === "paid") {
    return { ok: true, already_processed: true, purpose: payment.purpose, order_id: payment.order_id ?? null };
  }

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${paystackSecret}` },
  });

  const verifyData = await verifyRes.json();
  if (!verifyRes.ok || !verifyData?.status) {
    throw new Error(verifyData?.message ?? "Unable to verify payment");
  }

  const trx = verifyData.data;
  if (trx?.status !== "success") {
    await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return { ok: false, status: trx?.status ?? "failed" };
  }

  const paidAmount = Number(trx.amount ?? 0) / 100;
  if (Math.round(paidAmount * 100) < Math.round(Number(payment.amount) * 100)) {
    throw new Error("Paid amount is less than expected");
  }

  let orderId: string | null = null;

  if (payment.purpose === "order") {
    orderId = await fulfillOrder(admin, payment);
  }

  if (payment.purpose === "agent_activation") {
    const userId = payment.user_id;
    if (!userId) throw new Error("Missing user for activation payment");
    await activateAgent(admin, userId);
  }

  await admin
    .from("payments")
    .update({ status: "paid", order_id: orderId })
    .eq("id", payment.id);

  return { ok: true, purpose: payment.purpose, order_id: orderId };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const reference = String(body?.reference ?? "").trim();
    if (!reference) return json({ error: "reference is required" }, 400);

    const result = await verifyAndProcess(reference);
    return json(result);
  } catch (e: any) {
    console.error("paystack-verify error", e);
    return json({ error: e?.message ?? "Internal error" }, 500);
  }
});
