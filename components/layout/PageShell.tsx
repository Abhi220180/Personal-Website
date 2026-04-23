import { PageTopNav } from "@/components/ui/PageTopNav";
import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  withTopNav?: boolean;
}

export function PageShell({ children, withTopNav = false }: PageShellProps) {
  return (
    <main className="relative overflow-x-clip text-ink">
      {withTopNav ? <PageTopNav /> : null}
      {children}
    </main>
  );
}
