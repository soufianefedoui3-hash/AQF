import Link from "next/link";
import { cn } from "@/lib/utils";
import { LOGO_PATH, LOGO_PATH_LIGHT } from "@/lib/brand";

type LogoVariant = "navbar" | "footer" | "hero" | "admin" | "mockup" | "login" | "icon";
type LogoTone = "default" | "light";

const variantStyles: Record<
  LogoVariant,
  {
    wrapper: string;
    img: string;
    tone?: LogoTone;
  }
> = {
  navbar: {
    wrapper: "h-10 max-h-10 w-[7.5rem] max-w-[7.5rem] sm:w-[8rem] sm:max-w-[8rem]",
    img: "object-contain object-left",
  },
  footer: {
    wrapper: "h-12 max-h-12 w-[8.5rem] max-w-[8.5rem] sm:h-14 sm:max-h-14 sm:w-[9.5rem] sm:max-w-[9.5rem]",
    img: "object-contain object-left",
    tone: "light",
  },
  hero: {
    wrapper:
      "h-40 w-auto max-w-[90vw] sm:max-w-[26rem] md:h-56 md:max-w-[32rem] lg:h-64 lg:max-w-[36rem]",
    img: "h-full w-auto object-contain object-center",
    tone: "light",
  },
  admin: {
    wrapper: "h-8 max-h-8 w-[6rem] max-w-[6rem]",
    img: "object-contain object-left",
    tone: "light",
  },
  mockup: {
    wrapper: "h-9 max-h-9 w-[4rem] max-w-[4rem]",
    img: "object-contain object-center",
  },
  login: {
    wrapper: "h-14 max-h-14 w-[8.5rem] max-w-[8.5rem] sm:h-16 sm:max-h-16 sm:w-[9.5rem] sm:max-w-[9.5rem]",
    img: "object-contain object-center",
  },
  icon: {
    wrapper: "h-8 max-h-8 w-[5rem] max-w-[5rem]",
    img: "object-contain object-left",
  },
};

interface LogoProps {
  variant?: LogoVariant;
  href?: string | null;
  className?: string;
  priority?: boolean;
  tone?: LogoTone;
}

export function Logo({
  variant = "navbar",
  href = "/",
  className,
  priority = false,
  tone,
}: LogoProps) {
  const style = variantStyles[variant];
  const resolvedTone = tone ?? style.tone ?? "default";
  const src = resolvedTone === "light" ? LOGO_PATH_LIGHT : LOGO_PATH;
  const shouldPrioritize = priority || variant === "navbar" || variant === "hero";

  const image = (
    <span
      className={cn(
        "brand-logo inline-flex shrink-0 items-center justify-center overflow-hidden",
        style.wrapper,
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="AQF — Académie de Qualité et de Formation"
        decoding="async"
        fetchPriority={shouldPrioritize ? "high" : "auto"}
        className={cn(
          "block h-full max-w-full",
          variant === "hero" ? "w-auto" : "w-full",
          style.img
        )}
      />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 transition opacity-95 hover:opacity-100">
        {image}
      </Link>
    );
  }

  return image;
}

export function LogoMark({ className }: { className?: string }) {
  return <Logo variant="icon" href={null} className={className} />;
}
