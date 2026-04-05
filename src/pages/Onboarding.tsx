import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bio: "",
    brandColor: "#F4A261",
    subdomain: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleFinish = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in first");
      navigate("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        bio: form.bio,
        brand_color: form.brandColor,
        subdomain: form.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        onboarded: true,
      })
      .eq("id", user.id);

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("You're all set!");
      navigate("/app/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">
            Set up your <span className="text-primary">studio</span>
          </h1>
          <p className="text-muted-foreground text-sm">Step {step} of 2</p>
          <div className="flex gap-2 mt-4 justify-center">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-16 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="subdomain">Choose your subdomain</Label>
                <div className="flex items-center gap-0">
                  <Input
                    id="subdomain"
                    placeholder="kofi"
                    value={form.subdomain}
                    onChange={(e) => update("subdomain", e.target.value)}
                    className="rounded-r-none"
                  />
                  <span className="h-10 px-3 flex items-center bg-muted border border-l-0 border-input rounded-r-md text-sm text-muted-foreground">
                    .mystori.com
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Short bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell clients about your photography style…"
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  rows={3}
                />
              </div>

              <Button className="w-full" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="brandColor">Brand accent color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="brandColor"
                    value={form.brandColor}
                    onChange={(e) => update("brandColor", e.target.value)}
                    className="h-10 w-10 rounded-lg border border-input cursor-pointer"
                  />
                  <Input
                    value={form.brandColor}
                    onChange={(e) => update("brandColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">Preview</p>
                <div
                  className="h-12 rounded-lg flex items-center justify-center text-sm font-medium"
                  style={{ backgroundColor: form.brandColor, color: "#fff" }}
                >
                  Book Now
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleFinish} disabled={loading}>
                  {loading ? "Saving…" : "Finish Setup"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
