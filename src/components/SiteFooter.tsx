import Image from "next/image";
import Link from "next/link";
import { company, legalLinks } from "@/lib/content";
import { CurrentYear } from "./CurrentYear";

type Props = {
  /** The home page shows contact details in its own section above. */
  showContact?: boolean;
};

export function SiteFooter({ showContact = true }: Props) {
  return (
    <footer className="on-dark bg-ink text-ivory">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        {showContact && (
          <div className="grid gap-10 border-b border-line-dark py-14 md:grid-cols-[1.2fr_1fr]">
            <Image
              src="/brand/logo-on-dark.webp"
              alt={company.name}
              width={1400}
              height={357}
              className="h-14 w-auto self-start"
            />
            <ul className="grid gap-2 text-[0.9375rem]">
              <li>
                <a href={company.phoneHref} className="inline-flex min-h-11 items-center hover:text-gold">
                  {company.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="inline-flex min-h-11 items-center break-all hover:text-gold">
                  {company.email}
                </a>
              </li>
              <li className="text-muted-on-dark">{company.address}</li>
            </ul>
          </div>
        )}
        <div className="flex flex-col gap-4 py-8 text-sm text-muted-on-dark md:flex-row md:items-center md:justify-between">
          <p>
            © <CurrentYear /> {company.name}. All rights reserved.
          </p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-6">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center hover:text-ivory">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
