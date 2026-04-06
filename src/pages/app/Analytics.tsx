import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Eye, Heart, CalendarDays } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const [stats, setStats] = useState({ galleries: 0, totalViews: 0, totalFavorites: 0, totalBookings: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const uid = session.user.id;

    const [galRes, bookRes] = await Promise.all([
      supabase.from("galleries").select("id, title, views_count, created_at").eq("photographer_id", uid),
      supabase.from("bookings").select("id").eq("photographer_id", uid),
    ]);

    const galleries = galRes.data || [];
    const totalViews = galleries.reduce((s, g) => s + (g.views_count || 0), 0);

    // Get favorites count
    const imageIds: string[] = [];
    if (galleries.length > 0) {
      const { data: imgs } = await supabase.from("gallery_images").select("id").in("gallery_id", galleries.map(g => g.id));
      (imgs || []).forEach(i => imageIds.push(i.id));
    }
    let totalFavorites = 0;
    if (imageIds.length > 0) {
      const { count } = await supabase.from("favorites").select("id", { count: "exact", head: true }).in("image_id", imageIds);
      totalFavorites = count || 0;
    }

    setStats({
      galleries: galleries.length,
      totalViews,
      totalFavorites,
      totalBookings: (bookRes.data || []).length,
    });

    // Chart: views per gallery
    setChartData(galleries.slice(0, 8).map(g => ({
      name: g.title.length > 12 ? g.title.substring(0, 12) + "…" : g.title,
      views: g.views_count || 0,
    })));
  };

  const cards = [
    { label: "Total Galleries", value: stats.galleries, icon: BarChart3, color: "text-primary" },
    { label: "Total Views", value: stats.totalViews, icon: Eye, color: "text-blue-500" },
    { label: "Total Favorites", value: stats.totalFavorites, icon: Heart, color: "text-pink-500" },
    { label: "Total Bookings", value: stats.totalBookings, icon: CalendarDays, color: "text-green-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Overview of your performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-secondary ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Views per Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No data yet – create galleries to see analytics</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
