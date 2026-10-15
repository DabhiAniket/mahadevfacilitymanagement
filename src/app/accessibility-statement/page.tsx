import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: `Accessibility of the ${company.name} website.`,
  alternates: { canonical: "/accessibility-statement" },
};

// Replaces the Wix template statement, which still contained unfilled
// placeholders. Describes only measures actually built into this site.
export default function AccessibilityStatementPage() {
  return (
    <LegalPage title="Accessibility Statement">
      <p>
        We want everyone to be able to use this website. It has been built with the aim of meeting
        the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.
      </p>

      <h2>What we have done</h2>
      <ul>
        <li>All content is real text in the page, so it works with screen readers and zoom.</li>
        <li>
          The 3D view is decorative. Every piece of information it accompanies is also written in
          the page, and the site works without it.
        </li>
        <li>The site can be used with a keyboard alone, with visible focus outlines.</li>
        <li>
          If your device is set to reduce motion, scroll-linked camera movement and entrance
          animations are switched off.
        </li>
        <li>Body text meets WCAG AA colour contrast.</li>
        <li>Buttons and links have touch targets of at least 44 by 44 pixels.</li>
      </ul>

      <h2>Feedback</h2>
      <p>
        If you find anything on this website difficult to use, please tell us and we will work to
        fix it.
      </p>
      <ul>
        <li>
          Email: <a href={`mailto:${company.email}`}>{company.email}</a>
        </li>
        <li>
          Phone: <a href={company.phoneHref}>{company.phoneDisplay}</a>
        </li>
      </ul>
    </LegalPage>
  );
}
