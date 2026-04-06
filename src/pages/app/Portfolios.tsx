import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Portfolios() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("portfolios")
      .select("*")
      .eq("photographer_id", session.user.id)
      .order("created_at", { ascending: false });

    setPortfolios(data || []);
    setLoading(false);
  };

  const createPortfolio = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("portfolios")
      .insert({
        photographer_id: session.user.id,
        title: "My Portfolio",
        sections: [],
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create portfolio");
      return;
    }

    toast.success("Portfolio created!");
    setPortfolios((prev) => [data, ...prev]);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Portfolios</h1>
          <p className="text-muted-foreground mt-1">Your branded portfolio websites</p>
        </div>
        <Button onClick={createPortfolio}>
          <Plus className="h-4 w-4 mr-2" /> Create Portfolio
        </Button>
      </div>

      {loading ? (
        <Card className="animate-pulse"><CardContent className="p-6"><div className="h-4 bg-secondary rounded w-1/3" /></CardContent></Card>
      ) : portfolios.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-medium mb-1">No portfolios yet</h3>
            <p className="text-sm mb-6">Create a portfolio to showcase your work and accept bookings</p>
            <Button onClick={createPortfolio}>
              <Plus className="h-4 w-4 mr-2" /> Create Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {portfolios.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.tagline || "No tagline"}</p>
                <div className="flex items-center gap-2 mt-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.published ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/app/portfolios/${p.id}/edit`}>Edit</Link>
                  </Button>
                  {p.published && (
                    <Button asChild size="sm" variant="ghost">
                      <a href={`/p/${p.photographer_id}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                      </a>
                    </Button>
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
