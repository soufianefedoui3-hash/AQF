export type HomepageSectionItem = {
  key: string;
  title: string | null;
  content: string;
};

export function HomepagePresentation({
  presentation,
  extraSections,
}: {
  presentation?: HomepageSectionItem;
  extraSections: HomepageSectionItem[];
}) {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <span className="mb-4 inline-block rounded-full bg-secondary-100 px-4 py-1.5 text-sm font-medium text-secondary-800 ring-1 ring-secondary-200">
          {presentation?.title?.trim() || "Présentation"}
        </span>
        <p className="text-lg leading-relaxed text-text-muted">
          {presentation?.content}
        </p>
      </div>
      {extraSections.length > 0 ? (
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2">
          {extraSections.map((section) => (
            <div
              key={section.key}
              className="rounded-2xl border border-primary-100 bg-white p-6 text-left shadow-sm"
            >
              <h3 className="mb-3 text-lg font-semibold text-primary-900">
                {section.title?.trim() || "Section"}
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
