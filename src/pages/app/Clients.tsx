import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Mail, Phone } from "lucide-react";

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Aggregate unique clients from bookings and galleries
    const [bookRes, galRes] = await Promise.all([
      supabase.from("bookings").select("client_name, client_email, client_phone, created_at").eq("photographer_id", session.user.id),
      supabase.from("galleries").select("client_name, created_at").eq("photographer_id", session.user.id),
    ]);

    const map = new Map<string, any>();
    (bookRes.data || []).forEach((b) => {
      const key = b.client_name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { name: b.client_name, email: b.client_email, phone: b.client_phone, interactions: 0, lastSeen: b.created_at });
      }
      const c = map.get(key)!;
      c.interactions++;
      if (b.created_at > c.lastSeen) c.lastSeen = b.created_at;
    });
    (galRes.data || []).forEach((g) => {
      const key = g.client_name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { name: g.client_name, email: null, phone: null, interactions: 0, lastSeen: g.created_at });
      }
      const c = map.get(key)!;
      c.interactions++;
      if (g.created_at > c.lastSeen) c.lastSeen = g.created_at;
    });

    setClients(Array.from(map.values()).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)));
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Clients</h1>
        <p className="text-muted-foreground mt-1">Your client history</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 bg-secondary rounded w-1/4" /></CardContent></Card>)}</div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-medium mb-1">No clients yet</h3>
            <p className="text-sm">Clients from your galleries and bookings will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients.map((c, i) => (
            <Card key={i}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                      {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{c.interactions} interaction{c.interactions !== 1 ? "s" : ""}</p>
                  <p className="text-xs">{new Date(c.lastSeen).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
