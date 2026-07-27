import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "accent" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-cta-gradient text-primary-900 hover:brightness-105 shadow-lg shadow-secondary-500/30 font-semibold",
    secondary:
      "bg-cta-gradient text-primary-900 hover:brightness-105 shadow-lg shadow-secondary-500/30 font-semibold",
    accent:
      "bg-accent-gradient text-white hover:brightness-105 shadow-lg shadow-accent-400/30",
    outline:
      "border-2 border-accent-400 text-primary-800 hover:bg-accent-50",
    ghost: "text-text-muted hover:bg-surface-muted hover:text-primary-900",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
