import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("photographer_id", session.user.id)
      .order("created_at", { ascending: false });

    setBookings(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error("Failed to update");
    else {
      toast.success(`Booking ${status}`);
      loadBookings();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Bookings</h1>
        <p className="text-muted-foreground mt-1">Manage your booking requests</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 bg-secondary rounded w-1/3" /></CardContent></Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-medium mb-1">No bookings yet</h3>
            <p className="text-sm">Bookings from your portfolio will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{b.client_name}</h3>
                  <p className="text-sm text-muted-foreground">{b.service_type || "General"}</p>
                  {b.booking_date && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(b.booking_date).toLocaleDateString()}
                    </p>
                  )}
                  {b.client_email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {b.client_email}
                    </p>
                  )}
                  {b.client_phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {b.client_phone}
                    </p>
                  )}
                  {b.message && <p className="text-sm mt-2 italic">"{b.message}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    b.status === "confirmed" ? "bg-green-100 text-green-700" :
                    b.status === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{b.status}</span>
                  {b.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")}>Confirm</Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "cancelled")}>Decline</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
