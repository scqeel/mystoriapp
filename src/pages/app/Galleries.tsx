import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Image, Eye, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function Galleries() {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGalleries();
  }, []);

  const loadGalleries = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("galleries")
      .select("*")
      .eq("photographer_id", session.user.id)
      .order("created_at", { ascending: false });

    setGalleries(data || []);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Galleries</h1>
          <p className="text-muted-foreground mt-1">Manage your client galleries</p>
        </div>
        <Button asChild>
          <Link to="/app/galleries/new">
            <Plus className="h-4 w-4 mr-2" /> New Gallery
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-secondary rounded w-3/4 mb-3" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Image className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-1">No galleries yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Create your first gallery to start delivering photos to clients</p>
            <Button asChild>
              <Link to="/app/galleries/new">
                <Plus className="h-4 w-4 mr-2" /> Create Gallery
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/app/galleries/${g.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                      {g.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{g.client_name}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {g.views_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(g.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {g.password_hash && (
                      <span className="inline-block mt-3 text-xs bg-secondary px-2 py-1 rounded">🔒 Protected</span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
