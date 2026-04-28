import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { BecomeAgent } from "@/components/buy/BecomeAgent";

export default function DashboardAgentPage() {
    const { isAgent } = useAuth();
    const nav = useNavigate();

    useEffect(() => {
      if (isAgent) nav("/agent", { replace: true });
    }, [isAgent, nav]);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1100px] px-5 py-6 md:px-8 xl:px-12">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            Agent Setup
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft md:p-7">
          <h1 className="text-2xl font-semibold text-foreground">Become an Agent</h1>
          <p className="mt-1 text-sm text-muted-foreground">Activate your store and start earning from each sale.</p>
          <div className="mt-6">
            <BecomeAgent onClose={() => {}} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
