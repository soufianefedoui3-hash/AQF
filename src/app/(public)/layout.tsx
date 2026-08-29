import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget";
import { getSiteSettings } from "@/lib/content";

/** Always fetch fresh CMS data so admin edits appear immediately. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings;
  try {
    settings = await getSiteSettings();
  } catch {
    settings = {
      whatsappNumber: "+212600000000",
      contactEmail: "contact@aqf.ma",
      contactPhone: "+212 600 000 000",
      address: "Maroc",
    };
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppWidget phone={settings.whatsappNumber} />
    </div>
  );
}
