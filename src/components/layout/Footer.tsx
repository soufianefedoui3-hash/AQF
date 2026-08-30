import Link from "next/link";
import { BRAND, SOCIAL_LINKS } from "@/lib/constants";
import { Logo } from "@/components/brand/Logo";
import { getNavLinks, getServiceLinks, getSiteSettings } from "@/lib/content";

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
    <footer className="bg-brand-gradient text-primary-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="footer" href="/" />
            <p className="mt-4 text-sm leading-relaxed text-primary-100">
              Excellence en qualité, formation et audit pour les secteurs les plus exigeants.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Navigation</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition hover:text-accent-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition hover:text-accent-300">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`mailto:${email}`} className="hover:text-accent-300">{email}</a>
              </li>
              <li>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-accent-300">{phone}</a>
              </li>
              <li>{address}</li>
            </ul>
            {SOCIAL_LINKS.filter((social) =>
              !/^https?:\/\/(www\.)?(linkedin|facebook|instagram)\.com\/?$/i.test(
                social.href
              )
            ).length > 0 && (
              <div className="mt-4 flex gap-3">
                {SOCIAL_LINKS.filter(
                  (social) =>
                    !/^https?:\/\/(www\.)?(linkedin|facebook|instagram)\.com\/?$/i.test(
                      social.href
                    )
                ).map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-800/60 text-xs font-medium transition hover:bg-accent-500 hover:text-white"
                  >
                    {social.name[0]}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-primary-700/50 pt-8 text-center text-sm text-primary-200">
          <p>&copy; {new Date().getFullYear()} {BRAND.fullName}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
