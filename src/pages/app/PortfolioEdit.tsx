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
import { ArrowLeft, Save, Trash2, Check } from "lucide-react";

const TEMPLATES = [
  { id: "classic", name: "Classic", desc: "Centered hero, clean 3-column grid" },
  { id: "editorial", name: "Editorial", desc: "Left-aligned hero, 2-column magazine layout" },
  { id: "bold", name: "Bold", desc: "Large hero, dramatic 3-column showcase" },
  { id: "minimal", name: "Minimal", desc: "Compact hero, tight 4-column grid" },
  { id: "cinematic", name: "Cinematic", desc: "Full-height hero, immersive 2-column" },
];

export default function PortfolioEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");

  useEffect(() => {
    if (id) loadPortfolio();
  }, [id]);

  const loadPortfolio = async () => {
    const { data } = await supabase.from("portfolios").select("*").eq("id", id).single();
    if (data) {
      setPortfolio(data);
      setSelectedTemplate((data.sections as any)?.template || "classic");
    }
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
        sections: { template: selectedTemplate },
      })
      .eq("id", portfolio.id);

    if (error) toast.error("Failed to save");
    else toast.success("Portfolio saved");
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this portfolio permanently?")) return;
    await supabase.from("portfolios").delete().eq("id", id!);
    toast.success("Portfolio deleted");
    navigate("/app/portfolios");
  };

  if (!portfolio) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/app/portfolios")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Portfolios
        </button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </Button>
      </div>

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

      {/* Template selector */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Choose a Template</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{t.name}</span>
                {selectedTemplate === t.id && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Portfolio"}
      </Button>
    </div>
  );
}
