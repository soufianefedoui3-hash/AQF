import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { PageBlockList } from "@/components/content/PageBlockList";
import { getCustomPageBySlug } from "@/lib/content";
import { isReservedPageSlug } from "@/lib/page-blocks";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (isReservedPageSlug(slug)) return {};
  const page = await getCustomPageBySlug(slug);
  if (!page) return {};
  return { title: page.title };
}

export default async function CustomPublicPage({ params }: PageProps) {
  const { slug } = await params;
  if (isReservedPageSlug(slug)) notFound();

  const page = await getCustomPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero title={page.title} />
      <PageBlockList blocks={page.blocks} />
    </>
  );
}
