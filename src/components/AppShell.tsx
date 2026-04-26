import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="app-shell pb-24">{children}</div>;
}