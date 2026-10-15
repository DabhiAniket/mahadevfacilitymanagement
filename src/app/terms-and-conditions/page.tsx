import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: `Terms of use for the ${company.name} website.`,
  alternates: { canonical: "/terms-and-conditions" },
};

// Draft website terms of use. The governing-law and jurisdiction clause is
// left for the company to confirm with its legal adviser.
export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions">
      <p>
        These terms apply to your use of this website, operated by {company.name} (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;). By using the website you agree to them.
      </p>

      <h2>Information on this website</h2>
      <p>
        The content on this website is general information about our company and services. It is
        not an offer or a contract. The scope, price and terms of any service are agreed separately
        in writing with each client.
      </p>
      <p>
        We try to keep the information accurate and up to date, but we do not guarantee that it is
        complete or free of errors, or that the website will always be available.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The {company.name} name, logo and the content of this website belong to us. You may not copy,
        reproduce or reuse them without our written permission, except as allowed by law.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree not to misuse the website, including by attempting to gain unauthorised access to
        it, disrupting it, or using it for any unlawful purpose.
      </p>

      <h2>Links to other websites</h2>
      <p>
        This website links to third-party services such as Google Maps. We are not responsible for
        their content or practices.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, we are not liable for any loss arising from your use of, or
        inability to use, this website or from reliance on its content.
      </p>

      <h2>Governing law</h2>
      <p>[To be confirmed by {company.name}: governing law and courts with jurisdiction.]</p>

      <h2>Changes</h2>
      <p>We may update these terms from time to time. The version on this page applies.</p>

      <h2>Contact</h2>
      <ul>
        <li>
          Email: <a href={`mailto:${company.email}`}>{company.email}</a>
        </li>
        <li>
          Phone: <a href={company.phoneHref}>{company.phoneDisplay}</a>
        </li>
        <li>Address: {company.address}</li>
      </ul>
    </LegalPage>
  );
}
