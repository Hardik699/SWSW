import { ReactNode } from "react";

interface ResponsiveFormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  columns?: 1 | 2;
}

/**
 * Responsive form wrapper
 * - Single column on mobile
 * - Double column on larger screens (if specified)
 */
export function ResponsiveForm({
  children,
  onSubmit,
  className = "",
  columns = 1,
}: ResponsiveFormProps) {
  const gridClass =
    columns === 2
      ? "grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
      : "space-y-4 md:space-y-6";

  return (
    <form onSubmit={onSubmit} className={`w-full ${className}`}>
      <div className={gridClass}>{children}</div>
    </form>
  );
}

interface FormGroupProps {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

/**
 * Form group wrapper - handles responsive form fields
 */
export function FormGroup({
  children,
  fullWidth = false,
  className = "",
}: FormGroupProps) {
  const spanClass = fullWidth ? "sm:col-span-2" : "";
  return (
    <div className={`space-y-2 ${spanClass} ${className}`}>{children}</div>
  );
}
