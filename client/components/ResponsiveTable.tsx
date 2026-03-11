import { ReactNode } from "react";

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * Responsive table wrapper - handles horizontal scroll on mobile
 * Usage: Wrap your Table component with this
 */
export function ResponsiveTable({
  children,
  className = "",
}: ResponsiveTableProps) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-lg border border-slate-700 ${className}`}
    >
      <div className="inline-block min-w-full">{children}</div>
    </div>
  );
}
