import { useLocation } from "react-router-dom";
import { Briefcase, Home, Package, Signal, User as UserIcon, Zap } from "lucide-react";
import { BuyDataFlow } from "@/components/buy/BuyDataFlow";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardBuyPage() {
  const { isAgent } = useAuth();
  const loc = useLocation();

  const sidebarItems = [
    { label: "Overview", to: "/dashboard", icon: <Home className="h-4 w-4" />, active: loc.pathname === "/dashboard" },
    { label: "Buy Data", to: "/dashboard/buy", icon: <Signal className="h-4 w-4" />, active: loc.pathname === "/dashboard/buy" },
    { label: "Track Orders", to: "/dashboard/track", icon: <Package className="h-4 w-4" />, active: loc.pathname === "/dashboard/track" },
    { label: isAgent ? "My Store" : "Become Agent", to: isAgent ? "/agent" : "/dashboard/agent", icon: <Briefcase className="h-4 w-4" />, active: loc.pathname === "/dashboard/agent" || loc.pathname === "/agent" },
    { label: "Profile", to: "/dashboard/profile", icon: <UserIcon className="h-4 w-4" />, active: loc.pathname === "/dashboard/profile" },
  ];

  return (
    <DashboardLayout title="Buy Data" subtitle="Complete purchases from your dashboard workspace." badge="Purchase Flow" sidebarItems={sidebarItems}>
      <div>
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft md:p-7">
          <h1 className="text-2xl font-semibold text-foreground">Buy Data</h1>
          <p className="mt-1 text-sm text-muted-foreground">Select network, bundle, and recipient details to complete your order.</p>
          <div className="mt-6">
            <BuyDataFlow />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
