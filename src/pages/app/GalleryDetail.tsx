import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Eye, Heart, MessageCircle, ExternalLink, Trash2, Copy, ImageIcon, Check } from "lucide-react";

export default function GalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadGallery();
  }, [id]);

  const loadGallery = async () => {
    const [galRes, imgRes, comRes] = await Promise.all([
      supabase.from("galleries").select("*").eq("id", id).single(),
      supabase.from("gallery_images").select("*").eq("gallery_id", id).order("sort_order"),
      supabase.from("comments").select("*").eq("gallery_id", id!).order("created_at", { ascending: false }),
    ]);

    // Get favorites for these images
    const imageIds = (imgRes.data || []).map((img: any) => img.id);
    let favData: any[] = [];
    if (imageIds.length > 0) {
      const { data } = await supabase.from("favorites").select("*").in("image_id", imageIds);
      favData = data || [];
    }

    setGallery(galRes.data);
    setImages(imgRes.data || []);
    setComments(comRes.data || []);
    setFavorites(favData);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!gallery) return;
    setSaving(true);
    const { error } = await supabase
      .from("galleries")
      .update({
        title: gallery.title,
        client_name: gallery.client_name,
        welcome_message: gallery.welcome_message,
        note: gallery.note,
      })
      .eq("id", gallery.id);

    if (error) toast.error("Failed to save");
    else toast.success("Gallery updated");
    setSaving(false);
  };

  const setCoverImage = async (imageId: string) => {
    const { error } = await supabase.from("galleries").update({ cover_image_id: imageId }).eq("id", id!);
    if (error) toast.error("Failed to set cover image");
    else {
      setGallery({ ...gallery, cover_image_id: imageId });
      toast.success("Cover image set!");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this gallery and all its images?")) return;
    await supabase.from("gallery_images").delete().eq("gallery_id", id!);
    await supabase.from("galleries").delete().eq("id", id!);
    toast.success("Gallery deleted");
    navigate("/app/galleries");
  };

  const copyLink = () => {
    const url = `${window.location.origin}/g/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Gallery link copied!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Gallery not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app/galleries">Back to Galleries</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/app/galleries")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="h-4 w-4 mr-2" /> Copy Link
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/g/${id}`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> Preview
            </a>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {gallery.views_count || 0} views</span>
        <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {favorites.length} favorites</span>
        <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {comments.length} comments</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Gallery Title</Label>
                <Input value={gallery.title} onChange={(e) => setGallery({ ...gallery, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input value={gallery.client_name} onChange={(e) => setGallery({ ...gallery, client_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Textarea value={gallery.welcome_message || ""} onChange={(e) => setGallery({ ...gallery, welcome_message: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Private Note</Label>
                <Textarea value={gallery.note || ""} onChange={(e) => setGallery({ ...gallery, note: e.target.value })} rows={2} />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Images grid */}
          <h2 className="text-lg font-semibold">Photos ({images.length})</h2>
          <p className="text-xs text-muted-foreground mb-2">Click an image to set it as cover</p>
          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground">No images uploaded yet</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`aspect-square rounded-lg overflow-hidden bg-secondary relative group cursor-pointer ring-2 ${gallery.cover_image_id === img.id ? "ring-primary" : "ring-transparent"}`}
                  onClick={() => setCoverImage(img.id)}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  {gallery.cover_image_id === img.id && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Comments</h2>
          <Card>
            <CardContent className="p-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No comments yet</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {comments.map((c) => (
                    <div key={c.id} className="text-sm">
                      <p className="font-medium">{c.author}</p>
                      <p className="text-muted-foreground mt-0.5">{c.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(c.created_at).toLocaleDateString()}
                      </p>
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
