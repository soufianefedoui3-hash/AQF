import { Logo } from "@/components/brand/Logo";

interface PackMockupProps {
  name: string;
  description?: string;
}

export function PackMockup({ name, description }: PackMockupProps) {
  return (
    <div className="group perspective-[800px]">
      <div className="relative transition-transform duration-500 group-hover:[transform:rotateY(-8deg)_rotateX(4deg)_translateY(-8px)]">
        <div className="absolute -bottom-4 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-primary-900/10 blur-xl" />

        <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px]">
          <div className="absolute right-0 top-[8%] h-[84%] w-[18%] origin-left skew-y-[45deg] rounded-r-sm border border-primary-100 bg-surface-muted shadow-inner" />
          <div className="absolute left-[8%] top-0 h-[12%] w-[84%] origin-bottom skew-x-[45deg] rounded-t-sm border border-primary-100 bg-white" />

          <div className="absolute left-0 top-[8%] flex h-[84%] w-[88%] flex-col items-center justify-center rounded-xl border border-primary-100 bg-white p-4 shadow-xl shadow-primary-900/10">
            <div className="mb-3 flex justify-center">
              <Logo variant="mockup" href={null} />
            </div>
            <div className="my-2 h-px w-14 bg-accent-300" />
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-600">
                Pack d&apos;implémentation
              </p>
              <p className="mt-1.5 text-lg font-bold text-primary-900">{name}</p>
            </div>
          </div>
        </div>

        {description && (
          <p className="mt-6 text-center text-sm leading-relaxed text-text-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
