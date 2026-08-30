import { getNavLinks, getServiceLinks, getSiteSettings } from "@/lib/content";
import { SiteFooter } from "@/components/layout/SiteFooter";

export async function Footer() {
  let settings;
  try {
    settings = await getSiteSettings();
  } catch {
    settings = null;
  }
  const email = settings?.contactEmail || "contact@aqf.ma";
  const phone = settings?.contactPhone || "+212 600 000 000";
  const address = settings?.address || "Maroc";
  const [navLinks, serviceLinks] = await Promise.all([getNavLinks(), getServiceLinks()]);

  return (
    <SiteFooter
      navLinks={navLinks}
      serviceLinks={serviceLinks}
      email={email}
      phone={phone}
      address={address}
    />
  );
}
