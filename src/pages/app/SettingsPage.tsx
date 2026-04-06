import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    setProfile(data);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        studio_name: profile.studio_name,
        bio: profile.bio,
        phone: profile.phone,
        brand_color: profile.brand_color,
        subdomain: profile.subdomain,
      })
      .eq("id", profile.id);

    if (error) toast.error("Failed to save");
    else toast.success("Settings saved");
    setSaving(false);
  };

  if (!profile) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Studio Name</Label>
              <Input value={profile.studio_name || ""} onChange={(e) => setProfile({ ...profile, studio_name: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Subdomain</Label>
              <div className="flex items-center">
                <Input value={profile.subdomain || ""} onChange={(e) => setProfile({ ...profile, subdomain: e.target.value })} />
                <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">.mystori.com</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Brand Color</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={profile.brand_color || "#F4A261"} onChange={(e) => setProfile({ ...profile, brand_color: e.target.value })} className="w-10 h-10 rounded border-0 cursor-pointer" />
              <Input value={profile.brand_color || "#F4A261"} onChange={(e) => setProfile({ ...profile, brand_color: e.target.value })} className="max-w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>WhatsApp Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">WhatsApp Business API</p>
              <p className="text-sm text-muted-foreground">Receive instant notifications for new bookings</p>
            </div>
            <Switch disabled />
          </div>
          <p className="text-xs text-muted-foreground mt-3 bg-secondary p-3 rounded-lg">
            Coming soon — WhatsApp Business API integration will allow you to receive instant booking and gallery activity notifications.
          </p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
