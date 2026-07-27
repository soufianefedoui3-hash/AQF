"use client";

import Image from "next/image";
import { useState } from "react";
import { Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeImageUrl } from "@/lib/news";

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
  sizes = "(max-width: 768px) 100vw, 33vw",
}: ArticleImageProps) {
  const [error, setError] = useState(false);
  const imageUrl = normalizeImageUrl(src);

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
        <Newspaper className="h-12 w-12 text-primary-300" />
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt || "Image de l'article"}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
      onError={() => setError(true)}
    />
  );
}
