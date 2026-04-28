import { Link } from "react-router-dom";
import { ArrowLeft, Search, UserPlus } from "lucide-react";
import { BuyDataFlow } from "@/components/buy/BuyDataFlow";

export default function PublicBuyPage() {
  return (
    <div className="mx-auto w-full max-w-[980px] px-5 py-8 md:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to homepage
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">No account needed</span>
          <Link to="/auth?tab=signup" className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 hover:text-foreground">
            <UserPlus className="h-3.5 w-3.5" /> Create account
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-float backdrop-blur-sm md:p-8">
        <h1 className="text-2xl font-semibold">Buy Data Instantly</h1>
        <p className="mt-1 text-sm text-muted-foreground">Checkout is handled by Paystack. You can buy without signing in.</p>
        <div className="mt-6">
          <BuyDataFlow />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground">
        Already paid? Track your order using your phone number on the
        <Link to="/track" className="ml-1 inline-flex items-center gap-1 text-primary hover:text-primary/80">
          <Search className="h-3.5 w-3.5" /> Track page
        </Link>.
      </div>
    </div>
  );
}
