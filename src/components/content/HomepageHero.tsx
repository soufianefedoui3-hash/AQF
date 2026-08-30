import { Logo } from "@/components/brand/Logo";
import { SITE_COPY_DEFAULTS } from "@/lib/site-copy";

export function HomepageHero({
  tagline = SITE_COPY_DEFAULTS.hero_tagline,
}: {
  tagline?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-brand-gradient pb-20 pt-12 md:pb-24 md:pt-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c8e8' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <Logo variant="hero" href={null} priority className="mx-auto" />
        {tagline.trim() ? (
          <p className="mx-auto mt-8 max-w-xl text-base text-accent-100 sm:text-lg">{tagline}</p>
        ) : null}
      </div>
    </section>
  );
}
