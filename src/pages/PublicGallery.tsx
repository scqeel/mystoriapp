import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Heart, MessageCircle, Download, X, ChevronLeft, ChevronRight, Lock, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getSessionId() {
  let sid = localStorage.getItem("mystori_session");
  if (!sid) { sid = crypto.randomUUID(); localStorage.setItem("mystori_session", sid); }
  return sid;
}

export default function PublicGallery() {
  const { id } = useParams<{ id: string }>();
  const [gallery, setGallery] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentMsg, setCommentMsg] = useState("");
  const [showFavs, setShowFavs] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const sessionId = getSessionId();

  useEffect(() => {
    if (id) loadGallery();
  }, [id]);

  const loadGallery = async () => {
    const { data: gal, error } = await supabase
      .from("galleries").select("*").eq("id", id).single();
    if (error || !gal) { setNotFound(true); setLoading(false); return; }

    // Increment views
    supabase.from("galleries").update({ views_count: (gal.views_count || 0) + 1 }).eq("id", gal.id).then();

    // Log activity
    supabase.from("activity_logs").insert({
      photographer_id: gal.photographer_id,
      type: "gallery_view",
      message: `Gallery "${gal.title}" was viewed`,
      metadata: { gallery_id: gal.id },
    }).then();

    if (gal.password_hash) { setGallery(gal); setLocked(true); setLoading(false); return; }

    await loadGalleryData(gal);
  };

  const loadGalleryData = async (gal: any) => {
    const [imgRes, comRes, profRes] = await Promise.all([
      supabase.from("gallery_images").select("*").eq("gallery_id", gal.id).order("sort_order"),
      supabase.from("comments").select("*").eq("gallery_id", gal.id).order("created_at", { ascending: true }),
      supabase.from("profiles").select("*").eq("id", gal.photographer_id).single(),
    ]);

    const imgs = imgRes.data || [];
    const imageIds = imgs.map((i: any) => i.id);
    let favSet = new Set<string>();
    if (imageIds.length > 0) {
      const { data: favs } = await supabase.from("favorites").select("image_id").eq("client_session", sessionId).in("image_id", imageIds);
      favSet = new Set((favs || []).map((f: any) => f.image_id));
    }

    setGallery(gal);
    setProfile(profRes.data);
    setImages(imgs);
    setComments(comRes.data || []);
    setFavorites(favSet);
    setLocked(false);
    setLoading(false);
  };

  const handleUnlock = async () => {
    if (!gallery) return;
    // Simple check — password_hash is stored as plain text for now
    if (password === gallery.password_hash) {
      await loadGalleryData(gallery);
    } else {
      toast.error("Incorrect password");
    }
  };

  const toggleFav = async (imageId: string) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(imageId)) {
      newFavs.delete(imageId);
      await supabase.from("favorites").delete().eq("image_id", imageId).eq("client_session", sessionId);
    } else {
      newFavs.add(imageId);
      await supabase.from("favorites").insert({ image_id: imageId, client_session: sessionId });
    }
    setFavorites(newFavs);
  };

  const addComment = async (imageId?: string) => {
    if (!commentMsg.trim()) return;
    const { data } = await supabase.from("comments").insert({
      gallery_id: id!,
      image_id: imageId || null,
      author: commentAuthor || "Client",
      message: commentMsg,
    }).select().single();
    if (data) setComments((prev) => [...prev, data]);
    setCommentMsg("");
    toast.success("Comment posted!");
  };

  const handleDownload = async (url: string, idx: number) => {
    const a = document.createElement("a");
    a.href = url; a.download = `photo-${idx + 1}.jpg`; a.target = "_blank"; a.click();
  };

  const brandColor = gallery?.brand_color || "#F4A261";

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxIdx === null) return;
    if (e.key === "Escape") setLightboxIdx(null);
    if (e.key === "ArrowRight") setLightboxIdx((prev) => Math.min((prev || 0) + 1, images.length - 1));
    if (e.key === "ArrowLeft") setLightboxIdx((prev) => Math.max((prev || 0) - 1, 0));
  }, [lightboxIdx, images.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: brandColor }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
        <Camera className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Gallery Not Found</h1>
        <p className="text-muted-foreground">This gallery may have been removed or the link is incorrect.</p>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center space-y-6">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <div>
            <h1 className="text-2xl font-semibold">{gallery.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">This gallery is password protected</p>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            />
            <Button onClick={handleUnlock} className="w-full" style={{ backgroundColor: brandColor }}>
              View Gallery
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const favImages = images.filter((img) => favorites.has(img.id));

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Hero */}
      <header className="relative py-16 md:py-24 px-6 text-center" style={{ background: `linear-gradient(135deg, ${brandColor}22, ${brandColor}08)` }}>
        {profile?.logo_url && (
          <img src={profile.logo_url} alt="Logo" className="h-12 mx-auto mb-6 object-contain" />
        )}
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-semibold" style={{ color: "#111" }}>
          {gallery.title}
        </motion.h1>
        <p className="mt-2 text-muted-foreground">For {gallery.client_name}</p>
        {gallery.welcome_message && (
          <p className="mt-4 max-w-lg mx-auto text-muted-foreground text-sm leading-relaxed">{gallery.welcome_message}</p>
        )}
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => setShowFavs(!showFavs)} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border transition-colors hover:bg-white/60" style={{ borderColor: brandColor, color: brandColor }}>
            <Heart className="h-4 w-4" /> {favorites.size} Favorites
          </button>
        </div>
      </header>

      {/* Favorites tray */}
      <AnimatePresence>
        {showFavs && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b" style={{ borderColor: `${brandColor}33` }}>
            <div className="max-w-6xl mx-auto px-6 py-6">
              <h3 className="font-medium text-sm mb-3">Your Favorites ({favImages.length})</h3>
              {favImages.length === 0 ? (
                <p className="text-xs text-muted-foreground">Tap the heart icon on photos to add favorites</p>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {favImages.map((img) => (
                    <img key={img.id} src={img.image_url} alt="" className="h-20 w-20 object-cover rounded-lg shrink-0 cursor-pointer" onClick={() => setLightboxIdx(images.indexOf(img))} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Masonry grid */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4">
          {images.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="break-inside-avoid mb-3 md:mb-4 group relative rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setLightboxIdx(idx)}
            >
              <img src={img.image_url} alt="" className="w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleFav(img.id); }} className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                    <Heart className={`h-4 w-4 ${favorites.has(img.id) ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                  </button>
                  {gallery.download_enabled && (
                    <button onClick={(e) => { e.stopPropagation(); handleDownload(img.image_url, idx); }} className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                      <Download className="h-4 w-4 text-gray-700" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Comments section */}
      <section className="max-w-2xl mx-auto px-6 py-12 border-t">
        <h2 className="text-xl font-semibold mb-6">Comments ({comments.length})</h2>
        <div className="space-y-4 mb-8">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{c.author}</span>
                <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{c.message}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Input placeholder="Your name" value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} />
          <Textarea placeholder="Leave a comment..." value={commentMsg} onChange={(e) => setCommentMsg(e.target.value)} rows={3} />
          <Button onClick={() => addComment()} style={{ backgroundColor: brandColor }}>Post Comment</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t text-xs text-muted-foreground">
        {profile?.studio_name && <p>📸 {profile.studio_name}</p>}
        <p className="mt-1">Powered by <span className="font-medium" style={{ color: brandColor }}>MyStori</span></p>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
            <button onClick={() => setLightboxIdx(null)} className="absolute top-4 right-4 text-white/70 hover:text-white p-2"><X className="h-6 w-6" /></button>
            {lightboxIdx > 0 && (
              <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }} className="absolute left-4 text-white/70 hover:text-white p-2"><ChevronLeft className="h-8 w-8" /></button>
            )}
            {lightboxIdx < images.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }} className="absolute right-4 text-white/70 hover:text-white p-2"><ChevronRight className="h-8 w-8" /></button>
            )}
            <img src={images[lightboxIdx].image_url} alt="" className="max-h-[90vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
            <div className="absolute bottom-6 flex gap-3">
              <button onClick={(e) => { e.stopPropagation(); toggleFav(images[lightboxIdx].id); }} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Heart className={`h-5 w-5 ${favorites.has(images[lightboxIdx].id) ? "fill-red-500 text-red-500" : "text-white"}`} />
              </button>
              {gallery.download_enabled && (
                <button onClick={(e) => { e.stopPropagation(); handleDownload(images[lightboxIdx].image_url, lightboxIdx); }} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <Download className="h-5 w-5 text-white" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
