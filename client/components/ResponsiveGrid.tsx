import { ReactNode } from "react";

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Responsive grid component with mobile-first design
 * Default: 1 column on mobile, 2 on tablet, 3 on desktop
 */
export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "md",
  className = "",
}: ResponsiveGridProps) {
  const gapClass = {
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-5 md:gap-6",
    lg: "gap-6 sm:gap-7 md:gap-8",
  }[gap];

  const colClass = `grid grid-cols-${columns.mobile} sm:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`;

  return (
    <div className={`${colClass} ${gapClass} ${className}`}>{children}</div>
  );
}

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Main responsive container with proper max-width and padding
 */
export function ResponsiveContainer({
  children,
  className = "",
}: ResponsiveContainerProps) {
  return (
    <div
      className={`w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
