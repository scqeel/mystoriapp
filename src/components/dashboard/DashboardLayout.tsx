import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageCircle, Search } from "lucide-react";
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
      <div className="mx-auto w-full max-w-[1540px] px-3 py-4 md:px-6 md:py-5 xl:px-8">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="flex w-full items-center gap-2 xl:w-auto">
            <label className="relative hidden w-full xl:block xl:w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search here"
                className="h-11 w-full rounded-2xl border border-border/60 bg-card/70 pl-10 pr-3 text-sm text-foreground outline-none backdrop-blur-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <button className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/70 text-muted-foreground transition-colors hover:text-foreground xl:inline-flex">
              <MessageCircle className="h-4 w-4" />
            </button>
            <button className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/70 text-muted-foreground transition-colors hover:text-foreground xl:inline-flex">
              <Bell className="h-4 w-4" />
            </button>
            {badge && <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{badge}</div>}
            {topActions}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 xl:gap-5">
          <aside className="self-start rounded-3xl border border-border/60 bg-sidebar/90 p-2 shadow-float backdrop-blur-sm lg:sticky lg:top-5 lg:col-span-3 lg:p-3 xl:col-span-2">
            {sidebarHeader && <div className="mb-2 px-2">{sidebarHeader}</div>}
            <nav className="flex gap-1 overflow-x-auto no-scrollbar lg:block lg:space-y-1">
              {sidebarItems.map((item) => {
                const itemClass = cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full",
                  item.active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
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

            <div className="mt-5 hidden rounded-2xl border border-primary/20 bg-primary/10 p-3 lg:block">
              <p className="text-xs font-semibold text-primary">Performance Mode</p>
              <p className="mt-1 text-xs text-muted-foreground">Organized workspace optimized for operations.</p>
            </div>
          </aside>

          <main className={cn("lg:col-span-9 xl:col-span-10", mainClassName)}>{children}</main>
        </div>
      </div>
    </AppShell>
  );
}
