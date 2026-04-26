export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <div className={`font-display font-bold tracking-tight ${cls}`}>
      <span className="gradient-text">One</span>
      <span className="text-foreground">Gig</span>
      <span className="ml-1 inline-block h-2 w-2 rounded-full bg-primary animate-float-pulse" />
    </div>
  );
}