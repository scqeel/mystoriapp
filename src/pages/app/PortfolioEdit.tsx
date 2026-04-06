import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function PortfolioEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadPortfolio();
  }, [id]);

  const loadPortfolio = async () => {
    const { data } = await supabase.from("portfolios").select("*").eq("id", id).single();
    setPortfolio(data);
  };

  const handleSave = async () => {
    if (!portfolio) return;
    setSaving(true);
    const { error } = await supabase
      .from("portfolios")
      .update({
        title: portfolio.title,
        tagline: portfolio.tagline,
        about: portfolio.about,
        published: portfolio.published,
      })
      .eq("id", portfolio.id);

    if (error) toast.error("Failed to save");
    else toast.success("Portfolio saved");
    setSaving(false);
  };

  if (!portfolio) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <button onClick={() => navigate("/app/portfolios")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Portfolios
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Edit Portfolio</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Published</span>
          <Switch checked={portfolio.published || false} onCheckedChange={(v) => setPortfolio({ ...portfolio, published: v })} />
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label>Portfolio Title</Label>
            <Input value={portfolio.title} onChange={(e) => setPortfolio({ ...portfolio, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={portfolio.tagline || ""} onChange={(e) => setPortfolio({ ...portfolio, tagline: e.target.value })} placeholder="e.g. Capturing life's beautiful moments" />
          </div>
          <div className="space-y-2">
            <Label>About</Label>
            <Textarea value={portfolio.about || ""} onChange={(e) => setPortfolio({ ...portfolio, about: e.target.value })} placeholder="Tell your story..." rows={5} />
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-lg">
        🚧 Drag-and-drop section builder coming soon. For now, edit your portfolio content above and it will be displayed on your public portfolio page.
      </p>

      <Button onClick={handleSave} disabled={saving}>
        <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Portfolio"}
      </Button>
    </div>
  );
}
