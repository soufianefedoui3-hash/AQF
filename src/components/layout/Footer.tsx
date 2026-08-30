import { getContentLabels, getNavLinks, getServiceLinks, getSiteSettings } from "@/lib/content";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { resolveCopy } from "@/lib/site-copy";

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
  const [navLinks, serviceLinks, labels] = await Promise.all([
    getNavLinks(),
    getServiceLinks(),
    getContentLabels(),
  ]);

  return (
    <SiteFooter
      navLinks={navLinks}
      serviceLinks={serviceLinks}
      email={email}
      phone={phone}
      address={address}
      tagline={resolveCopy(labels, "footer_tagline")}
      navTitle={resolveCopy(labels, "footer_nav")}
      servicesTitle={resolveCopy(labels, "footer_services")}
      contactTitle={resolveCopy(labels, "footer_contact")}
      copyright={resolveCopy(labels, "footer_copyright")}
    />
  );
}
