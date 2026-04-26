import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const { withdrawal_id, action, note } = await req.json();
  if (!withdrawal_id || !["approve", "reject", "mark_paid"].includes(action)) {
    return json({ error: "Invalid request" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: ud } = await userClient.auth.getUser();
  if (!ud.user) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: ud.user.id, _role: "admin" });
  if (!isAdmin) return json({ error: "Forbidden" }, 403);

  const { data: w } = await admin.from("withdrawals").select("*").eq("id", withdrawal_id).maybeSingle();
  if (!w) return json({ error: "Not found" }, 404);

  if (action === "reject") {
    await admin.from("withdrawals").update({ status: "rejected", admin_note: note ?? null, processed_at: new Date().toISOString() }).eq("id", withdrawal_id);
    // Reverse the pending withdrawal tx
    await admin.from("wallet_transactions").update({ status: "reversed" })
      .eq("user_id", w.user_id)
      .eq("type", "withdrawal")
      .eq("status", "pending")
      .eq("amount", w.amount);
    return json({ ok: true });
  }

  const newStatus = action === "approve" ? "approved" : "paid";
  await admin.from("withdrawals").update({ status: newStatus, admin_note: note ?? null, processed_at: new Date().toISOString() }).eq("id", withdrawal_id);

  if (action === "mark_paid") {
    // Convert pending withdrawal tx to completed
    await admin.from("wallet_transactions").update({ status: "completed" })
      .eq("user_id", w.user_id)
      .eq("type", "withdrawal")
      .eq("status", "pending")
      .eq("amount", w.amount);
  }

  return json({ ok: true });
});