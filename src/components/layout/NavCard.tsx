import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function NavCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-primary-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent-300 hover:shadow-lg hover:shadow-accent-400/10"
    >
      <h3 className="text-lg font-semibold text-primary-900 group-hover:text-accent-600">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-text-muted">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-600">
        En savoir plus
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
