import { cn } from "@/lib/utils";

type ContainerSize = "2xl" | "3xl" | "4xl" | "7xl";

const CONTAINER: Record<ContainerSize, string> = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "7xl": "max-w-7xl",
};

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  container?: ContainerSize;
  containerClassName?: string;
  muted?: boolean;
}

/** Standard content section below PageHero — consistent vertical rhythm sitewide */
export function PageSection({
  children,
  className,
  container = "7xl",
  containerClassName,
  muted = false,
}: PageSectionProps) {
  return (
    <section
      className={cn("py-16 md:py-20", muted && "bg-surface-muted", className)}
    >
      <div
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          CONTAINER[container],
          containerClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

interface FormCardProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export function FormCard({ children, className, onSubmit }: FormCardProps) {
  if (onSubmit) {
    return (
      <form
        onSubmit={onSubmit}
        className={cn(
          "space-y-5 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm sm:p-8",
          className
        )}
      >
        {children}
      </form>
    );
  }

  return (
    <div
      className={cn(
        "space-y-5 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm sm:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AppointmentPanelProps {
  children: React.ReactNode;
  title?: string;
}

export function AppointmentPanel({
  children,
  title = "Rendez-vous sur site",
}: AppointmentPanelProps) {
  return (
    <div className="rounded-xl border border-primary-100 bg-accent-50/50 p-4">
      <p className="mb-3 text-sm font-medium text-primary-800">{title}</p>
      {children}
    </div>
  );
}

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function ContentCard({ children, className, hover }: ContentCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary-100 bg-white p-6 shadow-sm sm:p-8",
        hover && "transition hover:-translate-y-1 hover:border-accent-200 hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AdminPageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({ title, children }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-2xl font-bold text-primary-900">{title}</h2>
      {children}
    </div>
  );
}

export function AdminEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-primary-100 bg-white p-8 text-center text-text-muted">
      {children}
    </p>
  );
}

export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary-100 bg-white p-4 shadow-sm sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
