import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { TrackOrder } from "@/components/buy/TrackOrder";

export default function PublicTrackPage() {
  return (
    <div className="mx-auto w-full max-w-[980px] px-5 py-8 md:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to homepage
        </Link>
        <Link to="/buy" className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs hover:text-foreground">
          <ShoppingCart className="h-3.5 w-3.5" /> Buy without account
        </Link>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-float backdrop-blur-sm md:p-8">
        <h1 className="text-2xl font-semibold">Track Order</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your phone number to track recent orders.</p>
        <div className="mt-6">
          <TrackOrder />
        </div>
      </div>
    </div>
  );
}
