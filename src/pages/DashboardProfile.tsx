import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Shield, Store } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";

export default function DashboardProfilePage() {
  const nav = useNavigate();
  const { profile, isAdmin, isAgent, signOut } = useAuth();
  const { data: settings } = useSettings();

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[900px] px-5 py-6 md:px-8 xl:px-12">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

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
    </AppShell>
  );
}
