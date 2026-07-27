"use client";

import Image from "next/image";
import { useState } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectorImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export function SectorImage({
  src,
  alt,
  className,
  fill = true,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: SectorImageProps) {
  const [error, setError] = useState(false);
  const imageUrl = typeof src === "string" && src.trim() ? src.trim() : null;

  if (!imageUrl || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100",
          fill && "absolute inset-0",
          className
        )}
        aria-hidden={!alt}
      >
        <Building2 className="h-12 w-12 text-primary-300" />
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt || "Image du secteur"}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
      onError={() => setError(true)}
    />
  );
}
