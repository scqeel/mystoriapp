import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";

type SidebarItem = {
  label: string;
  icon?: ReactNode;
  to?: string;
  active?: boolean;
  onClick?: () => void;
};

export function DashboardLayout({
  title,
  subtitle,
  badge,
  sidebarHeader,
  sidebarItems,
  topActions,
  children,
  mainClassName,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  sidebarHeader?: ReactNode;
  sidebarItems: SidebarItem[];
  topActions?: ReactNode;
  children: ReactNode;
  mainClassName?: string;
}) {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 xl:px-12">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="flex w-full items-center gap-2 xl:w-auto">
            <label className="relative block w-full xl:w-[340px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search here"
                className="h-11 w-full rounded-2xl border border-border/60 bg-card pl-10 pr-3 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            {badge && <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{badge}</div>}
            {topActions}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <aside className="self-start rounded-3xl border border-border/60 bg-card p-3 shadow-soft lg:sticky lg:top-6 lg:col-span-3 xl:col-span-2">
            {sidebarHeader && <div className="mb-2 px-2">{sidebarHeader}</div>}
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const itemClass = cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                );

                if (item.to) {
                  return (
                    <Link key={item.label} to={item.to} className={itemClass}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <button key={item.label} type="button" onClick={item.onClick} className={itemClass}>
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className={cn("lg:col-span-9 xl:col-span-10", mainClassName)}>{children}</main>
        </div>
      </div>
    </AppShell>
  );
}
