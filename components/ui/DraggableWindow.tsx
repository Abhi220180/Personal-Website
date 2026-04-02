import type { ReactNode } from "react";

interface DraggableWindowProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function DraggableWindow({ children, title, subtitle, className = "" }: DraggableWindowProps) {
  return (
    <div className={className}>
      {title ? <p className="sr-only">{title}</p> : null}
      {subtitle ? <p className="sr-only">{subtitle}</p> : null}
      {children}
    </div>
  );
}
