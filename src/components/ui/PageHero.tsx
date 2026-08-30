import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toLocalImageUrl } from "@/lib/placeholder-images";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  image?: string;
  className?: string;
  titleNode?: ReactNode;
}

export function PageHero({
  title,
  subtitle,
  backHref,
  backLabel = "Retour",
  image,
  className,
  titleNode,
}: PageHeroProps) {
  const safeImage = toLocalImageUrl(image) || undefined;

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-brand-gradient pb-14 pt-10 md:pb-16 md:pt-12",
        className
      )}
    >
      {safeImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${safeImage})` }}
          aria-hidden
        />
      )}
      {safeImage && <div className="absolute inset-0 bg-brand-gradient/90" aria-hidden />}

      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c8e8' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {backHref && (
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-2 text-sm text-accent-200 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        )}
        {titleNode ?? (
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-primary-100">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
