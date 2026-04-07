import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera, Calendar, Mail, Phone, User, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

const TEMPLATES: Record<string, { heroStyle: string; gridCols: string; cardStyle: string; heroAlign: string }> = {
  classic: { heroStyle: "text-center py-24 md:py-36", gridCols: "grid-cols-2 md:grid-cols-3", cardStyle: "rounded-xl", heroAlign: "items-center" },
  editorial: { heroStyle: "text-left py-20 md:py-32", gridCols: "grid-cols-1 md:grid-cols-2", cardStyle: "rounded-none", heroAlign: "items-start" },
  bold: { heroStyle: "text-center py-28 md:py-40", gridCols: "grid-cols-1 md:grid-cols-3", cardStyle: "rounded-2xl", heroAlign: "items-center" },
  minimal: { heroStyle: "text-center py-16 md:py-24", gridCols: "grid-cols-3 md:grid-cols-4", cardStyle: "rounded-lg", heroAlign: "items-center" },
  cinematic: { heroStyle: "text-center py-32 md:py-48", gridCols: "grid-cols-1 md:grid-cols-2", cardStyle: "rounded-xl", heroAlign: "items-center" },
};

export default function PublicPortfolio() {
  const { username } = useParams<{ username: string }>();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [booking, setBooking] = useState({ client_name: "", client_email: "", client_phone: "", booking_date: "", service_type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (username) loadPortfolio();
  }, [username]);

  const loadPortfolio = async () => {
    // Find profile by subdomain or ID
    let profRes = await supabase.from("profiles").select("*").eq("subdomain", username).single();
    if (!profRes.data) {
      profRes = await supabase.from("profiles").select("*").eq("id", username).single();
    }
    if (!profRes.data) { setNotFound(true); setLoading(false); return; }

    const prof = profRes.data;
    const [portRes, galRes] = await Promise.all([
      supabase.from("portfolios").select("*").eq("photographer_id", prof.id).eq("published", true).limit(1).single(),
      supabase.from("galleries").select("*, gallery_images(image_url)").eq("photographer_id", prof.id).order("created_at", { ascending: false }).limit(6),
    ]);

    if (!portRes.data) { setNotFound(true); setLoading(false); return; }

    setProfile(prof);
    setPortfolio(portRes.data);
    setGalleries(galRes.data || []);
    setLoading(false);
  };

  const handleBooking = async () => {
    if (!booking.client_name || !booking.client_email) { toast.error("Please fill in your name and email"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      photographer_id: profile.id,
      client_name: booking.client_name,
      client_email: booking.client_email,
      client_phone: booking.client_phone,
      booking_date: booking.booking_date || null,
      service_type: booking.service_type,
      message: booking.message,
      status: "pending",
    });

    if (error) { toast.error("Failed to submit booking"); setSubmitting(false); return; }

    // Log activity
    await supabase.from("activity_logs").insert({
      photographer_id: profile.id,
      type: "new_booking",
      message: `New booking from ${booking.client_name}`,
      metadata: { client_name: booking.client_name },
    });

    toast.success("Booking sent! The photographer will get back to you soon.");
    setBooking({ client_name: "", client_email: "", client_phone: "", booking_date: "", service_type: "", message: "" });
    setSubmitting(false);
  };

  const brandColor = profile?.brand_color || "#F4A261";
  const templateKey = (portfolio?.sections as any)?.template || "classic";
  const tmpl = TEMPLATES[templateKey] || TEMPLATES.classic;

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
        <h1 className="text-2xl font-semibold mb-2">Portfolio Not Found</h1>
        <p className="text-muted-foreground">This photographer hasn't published a portfolio yet.</p>
      </div>
    );
  }

  const testimonials = [
    { name: "Sarah M.", text: "Absolutely stunning work! Every photo was perfect." },
    { name: "James K.", text: "Professional, creative, and so easy to work with." },
    { name: "Aisha R.", text: "The best photographer we've ever hired. Truly talented!" },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b px-6 py-3 flex justify-between items-center">
        <span className="font-semibold text-lg" style={{ color: "#111" }}>
          {profile?.studio_name || profile?.full_name}
        </span>
        <a href="#book" className="text-sm px-5 py-2 rounded-full text-white" style={{ backgroundColor: brandColor }}>
          Book Now
        </a>
      </nav>

      {/* Hero */}
      <section className={`${tmpl.heroStyle} px-6 flex flex-col ${tmpl.heroAlign}`} style={{ background: `linear-gradient(180deg, ${brandColor}12, transparent)`, paddingTop: "6rem" }}>
        {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-14 mb-6 object-contain" />}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-semibold max-w-3xl" style={{ color: "#111" }}>
          {portfolio.title}
        </motion.h1>
        {portfolio.tagline && (
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-muted-foreground max-w-xl">
            {portfolio.tagline}
          </motion.p>
        )}
        <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} href="#book" className="inline-flex items-center gap-2 mt-8 px-8 py-3 rounded-full text-white font-medium" style={{ backgroundColor: brandColor }}>
          Book a Session <ArrowRight className="h-4 w-4" />
        </motion.a>
      </section>

      {/* About */}
      {portfolio.about && (
        <section className="max-w-3xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-2xl font-semibold mb-4">About</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{portfolio.about}</p>
        </section>
      )}

      {/* Work grid */}
      {galleries.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold mb-8 text-center">Featured Work</h2>
          <div className={`grid ${tmpl.gridCols} gap-4`}>
            {galleries.map((g) => {
              const cover = g.gallery_images?.[0]?.image_url;
              return cover ? (
                <motion.div key={g.id} whileHover={{ scale: 1.02 }} className={`aspect-[4/5] overflow-hidden ${tmpl.cardStyle} relative group`}>
                  <img src={cover} alt={g.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-4">
                    <span className="text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">{g.title}</span>
                  </div>
                </motion.div>
              ) : null;
            })}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 px-6" style={{ backgroundColor: `${brandColor}08` }}>
        <h2 className="text-2xl font-semibold text-center mb-10">What Clients Say</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
              <p className="mt-3 text-sm font-medium">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Booking */}
      <section id="book" className="max-w-xl mx-auto px-6 py-16 md:py-20">
        <h2 className="text-2xl font-semibold text-center mb-2">Book a Session</h2>
        <p className="text-center text-muted-foreground mb-8 text-sm">Fill in the details and the photographer will get back to you</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Your Name *</Label>
              <Input placeholder="Full name" value={booking.client_name} onChange={(e) => setBooking({ ...booking, client_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email *</Label>
              <Input type="email" placeholder="email@example.com" value={booking.client_email} onChange={(e) => setBooking({ ...booking, client_email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input placeholder="+233..." value={booking.client_phone} onChange={(e) => setBooking({ ...booking, client_phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Preferred Date</Label>
              <Input type="date" value={booking.booking_date} onChange={(e) => setBooking({ ...booking, booking_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Service Type</Label>
            <Input placeholder="e.g. Wedding, Portrait, Event" value={booking.service_type} onChange={(e) => setBooking({ ...booking, service_type: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Message</Label>
            <Textarea placeholder="Tell the photographer about your vision..." rows={4} value={booking.message} onChange={(e) => setBooking({ ...booking, message: e.target.value })} />
          </div>
          <Button onClick={handleBooking} disabled={submitting} className="w-full text-white" style={{ backgroundColor: brandColor }}>
            {submitting ? "Sending..." : "Send Booking Request"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {profile?.studio_name || profile?.full_name}</p>
        <p className="mt-1">Powered by <span className="font-medium" style={{ color: brandColor }}>MyStori</span></p>
      </footer>
    </div>
  );
}
