import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-cta-gradient text-primary-900 hover:brightness-105 shadow-lg shadow-secondary-500/30 font-semibold",
  secondary:
    "bg-cta-gradient text-primary-900 hover:brightness-105 shadow-lg shadow-secondary-500/30 font-semibold",
  accent:
    "bg-accent-gradient text-white hover:brightness-105 shadow-lg shadow-accent-400/30",
  outline: "border-2 border-accent-400 text-primary-800 hover:bg-accent-50",
  ghost: "text-text-muted hover:bg-surface-muted hover:text-primary-900",
  danger: "bg-red-600 text-white hover:bg-red-700",
} as const;

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );
}

export function Button(props: ButtonProps) {
  const {
    className,
    variant = "primary",
    size = "md",
    loading,
    children,
  } = props;

  const classes = buttonClassName(variant, size, className);

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        target={props.target}
        rel={props.rel}
        className={classes}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Link>
    );
  }

  const {
    disabled,
    type = "button",
    ...buttonProps
  } = props as ButtonAsButton;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...buttonProps}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
