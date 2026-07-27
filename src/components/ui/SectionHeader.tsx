import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  centered = true,
  light = false,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-12", centered && "text-center")}>
      {badge && (
        <span
          className={cn(
            "mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-medium",
            light
              ? "bg-white/10 text-accent-200 ring-1 ring-accent-400/30"
              : "bg-secondary-100 text-secondary-800 ring-1 ring-secondary-200"
          )}
        >
          {badge}
        </span>
      )}
      <h2
        className={cn(
          "text-3xl font-bold tracking-tight sm:text-4xl",
          light ? "text-white" : "text-primary-900"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-lg",
            centered && "mx-auto max-w-2xl",
            light ? "text-primary-100" : "text-text-muted"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary-100 bg-white p-6 shadow-sm",
        hover &&
          "cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-lg hover:shadow-accent-400/10",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
