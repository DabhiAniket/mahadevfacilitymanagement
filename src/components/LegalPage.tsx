import { LEGAL_PAGES_APPROVED } from "@/lib/content";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function LegalPage({ title, children }: Props) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-[var(--header-h)]">
        <article className="mx-auto max-w-[760px] px-4 py-16 sm:px-6 md:py-24">
          {!LEGAL_PAGES_APPROVED && (
            <p role="note" className="mb-10 border-l-2 border-gold-deep bg-stone px-5 py-4 text-sm leading-relaxed">
              <strong>Draft.</strong> This page has not yet been reviewed or approved by Mahadev
              Facility Management Private Limited and is not in effect.
            </p>
          )}
          <h1 className="font-display text-[clamp(2.4rem,5vw,3.5rem)] leading-none font-medium">{title}</h1>
          <div className="legal mt-10">{children}</div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
