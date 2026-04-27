import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TrackOrder } from "@/components/buy/TrackOrder";

export default function DashboardTrackPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1100px] px-5 py-6 md:px-8 xl:px-12">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Search className="h-3.5 w-3.5" />
            Tracking
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft md:p-7">
          <h1 className="text-2xl font-semibold text-foreground">Track Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Search and monitor order progress by recipient number.</p>
          <div className="mt-6">
            <TrackOrder />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
