"use client";

import { useState } from "react";
import { Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeImageUrl } from "@/lib/news";
import { PLACEHOLDER_GENERIC } from "@/lib/placeholder-images";

interface ArticleImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export function ArticleImage({
  src,
  alt,
  className,
  fill = true,
  priority = false,
}: ArticleImageProps) {
  const [error, setError] = useState(false);
  const imageUrl = normalizeImageUrl(src) || PLACEHOLDER_GENERIC;

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100",
          fill && "absolute inset-0",
          className
        )}
        aria-hidden={!alt}
      >
        <Newspaper className="h-12 w-12 text-primary-300" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- avoid Next optimizer upstream 404s
    <img
      src={imageUrl}
      alt={alt || "Image de l'article"}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn(
        "object-cover",
        fill && "absolute inset-0 h-full w-full",
        className
      )}
      onError={() => setError(true)}
    />
  );
}
