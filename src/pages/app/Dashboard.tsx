import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, CalendarDays, Eye, Activity, Plus } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function Dashboard() {
  const [stats, setStats] = useState({ galleries: 0, bookings: 0, views: 0 });
  const [recentGalleries, setRecentGalleries] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const uid = session.user.id;

    const [galRes, bookRes, actRes] = await Promise.all([
      supabase.from("galleries").select("id, title, client_name, created_at, views_count").eq("photographer_id", uid).order("created_at", { ascending: false }).limit(4),
      supabase.from("bookings").select("*").eq("photographer_id", uid).order("created_at", { ascending: false }).limit(5),
      supabase.from("activity_logs").select("*").eq("photographer_id", uid).order("created_at", { ascending: false }).limit(8),
    ]);

    const galleries = galRes.data || [];
    const bookings = bookRes.data || [];
    setRecentGalleries(galleries);
    setRecentBookings(bookings);
    setActivities(actRes.data || []);

    const totalViews = galleries.reduce((sum: number, g: any) => sum + (g.views_count || 0), 0);
    setStats({
      galleries: galleries.length,
      bookings: bookings.length,
      views: totalViews,
    });
  };

  const statCards = [
    { label: "Active Galleries", value: stats.galleries, icon: Image, color: "text-primary" },
    { label: "Total Bookings", value: stats.bookings, icon: CalendarDays, color: "text-blue-500" },
    { label: "Gallery Views", value: stats.views, icon: Eye, color: "text-green-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to your studio</p>
        </div>
        <Button asChild>
          <Link to="/app/galleries/new">
            <Plus className="h-4 w-4 mr-2" /> New Gallery
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((s, i) => (
          <motion.div key={s.label} {...fadeUp} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`p-3 rounded-xl bg-secondary ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Galleries */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Recent Galleries</h2>
          {recentGalleries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Image className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No galleries yet</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/app/galleries/new">Create your first gallery</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentGalleries.map((g) => (
                <Link key={g.id} to={`/app/galleries/${g.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <h3 className="font-medium truncate">{g.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{g.client_name}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" /> {g.views_count || 0} views
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Activity</h2>
          <Card>
            <CardContent className="p-4">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 text-sm">
                      <Activity className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        <p className="text-foreground">{a.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <Card>
            <CardContent className="p-4">
              {recentBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No bookings yet</p>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{b.client_name}</p>
                        <p className="text-xs text-muted-foreground">{b.service_type || "General"}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
