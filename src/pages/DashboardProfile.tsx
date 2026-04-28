import { Link, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, Home, LogOut, Package, Shield, Signal, Store, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function DashboardProfilePage() {
  const nav = useNavigate();
  const loc = useLocation();
  const { profile, isAdmin, isAgent, signOut } = useAuth();
  const { data: settings } = useSettings();

  const sidebarItems = [
    { label: "Overview", to: "/dashboard", icon: <Home className="h-4 w-4" />, active: loc.pathname === "/dashboard" },
    { label: "Buy Data", to: "/dashboard/buy", icon: <Signal className="h-4 w-4" />, active: loc.pathname === "/dashboard/buy" },
    { label: "Track Orders", to: "/dashboard/track", icon: <Package className="h-4 w-4" />, active: loc.pathname === "/dashboard/track" },
    { label: isAgent ? "My Store" : "Become Agent", to: isAgent ? "/agent" : "/dashboard/agent", icon: <Briefcase className="h-4 w-4" />, active: loc.pathname === "/dashboard/agent" || loc.pathname === "/agent" },
    { label: "Profile", to: "/dashboard/profile", icon: <UserIcon className="h-4 w-4" />, active: loc.pathname === "/dashboard/profile" },
  ];

  return (
    <DashboardLayout title="Profile & Settings" subtitle="Manage account details and quick links." badge="Account" sidebarItems={sidebarItems}>
      <div>
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft md:p-8">
          <h1 className="text-2xl font-semibold text-foreground">Profile & Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account details and quick access links.</p>

          <div className="mt-6 rounded-2xl border border-border/60 bg-background/40 p-5">
            <p className="text-xs text-muted-foreground">Full name</p>
            <p className="font-medium">{profile?.full_name || "-"}</p>
            <p className="mt-3 text-xs text-muted-foreground">Username</p>
            <p className="font-medium">{profile?.username || "-"}</p>
            <p className="mt-3 text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{profile?.phone || "-"}</p>
            <p className="mt-3 text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{profile?.email || "-"}</p>
          </div>

          <div className="mt-5 space-y-2">
            {isAgent && (
              <Button asChild variant="outline" className="w-full h-12 rounded-xl">
                <Link to="/agent"><Store className="mr-2 h-4 w-4" /> Open Agent Store</Link>
              </Button>
            )}
            {isAdmin && (
              <Button asChild variant="outline" className="w-full h-12 rounded-xl">
                <Link to="/admin"><Shield className="mr-2 h-4 w-4" /> Admin Console</Link>
              </Button>
            )}
            <Button onClick={() => signOut().then(() => nav("/auth"))} variant="ghost" className="w-full h-12 rounded-xl text-destructive hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>

          {settings?.support_phone && (
            <p className="mt-5 text-xs text-center text-muted-foreground">Support: {settings.support_phone}</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
