"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PLACEHOLDER_GENERIC,
  toLocalImageUrl,
} from "@/lib/placeholder-images";

interface SectorImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

/**
 * Renders sector images with native <img> so local /uploads and
 * /placeholders paths work without the Next.js image optimizer.
 */
export function SectorImage({
  src,
  alt,
  className,
  fill = true,
  priority = false,
}: SectorImageProps) {
  const [error, setError] = useState(false);
  const imageUrl = toLocalImageUrl(src) || PLACEHOLDER_GENERIC;

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100",
          fill && "absolute inset-0 h-full w-full",
          className
        )}
        aria-hidden={!alt}
      >
        <Building2 className="h-12 w-12 text-primary-300" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local placeholders/uploads bypass optimizer
    <img
      src={imageUrl}
      alt={alt || "Image du secteur"}
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
