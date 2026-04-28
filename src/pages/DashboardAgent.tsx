import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Briefcase, BriefcaseBusiness, Home, Package, Signal, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BecomeAgent } from "@/components/buy/BecomeAgent";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function DashboardAgentPage() {
  const { isAgent } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (isAgent) nav("/agent", { replace: true });
  }, [isAgent, nav]);

  const sidebarItems = [
    { label: "Overview", to: "/dashboard", icon: <Home className="h-4 w-4" />, active: loc.pathname === "/dashboard" },
    { label: "Buy Data", to: "/dashboard/buy", icon: <Signal className="h-4 w-4" />, active: loc.pathname === "/dashboard/buy" },
    { label: "Track Orders", to: "/dashboard/track", icon: <Package className="h-4 w-4" />, active: loc.pathname === "/dashboard/track" },
    { label: "Become Agent", to: "/dashboard/agent", icon: <Briefcase className="h-4 w-4" />, active: loc.pathname === "/dashboard/agent" },
    { label: "Profile", to: "/dashboard/profile", icon: <UserIcon className="h-4 w-4" />, active: loc.pathname === "/dashboard/profile" },
  ];

  return (
    <DashboardLayout title="Become an Agent" subtitle="Activate your store and start earning." badge="Agent Setup" sidebarItems={sidebarItems}>
      <div>
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft md:p-7">
          <h1 className="text-2xl font-semibold text-foreground">Become an Agent</h1>
          <p className="mt-1 text-sm text-muted-foreground">Activate your store and start earning from each sale.</p>
          <div className="mt-6">
            <BecomeAgent onClose={() => {}} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
