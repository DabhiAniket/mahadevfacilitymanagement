import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${company.name} handles information on this website.`,
  alternates: { canonical: "/privacy-policy" },
};

// Draft written to match what this website actually does today: no forms, no
// cookies, no analytics, no third-party embeds, self-hosted fonts. Update it
// if any of that changes (for example, adding a contact form or analytics).
export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what information {company.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles
        when you visit this website or contact us through the details published on it.
      </p>

      <h2>What this website collects</h2>
      <p>
        This website has no forms, user accounts or analytics, and it does not set cookies. Fonts and
        images are served from this website, not from third-party services.
      </p>
      <p>
        Like any website, the servers that host it receive standard technical information with every
        request, such as your IP address, browser type, the page requested and the time of the
        request. This information is used to deliver the website, keep it secure and diagnose
        faults.
      </p>

      <h2>When you contact us</h2>
      <p>
        If you call us or email us, we receive the information you choose to share, such as your
        name, phone number, email address, property details and the content of your message. We use
        it to respond to you and, where you engage us, to provide and manage our services.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell your personal information. We share it only where needed to provide services
        you have asked for, with service providers who help us run our business, or where required
        by law.
      </p>

      <h2>Links to other websites</h2>
      <p>
        The &ldquo;Open in Google Maps&rdquo; link takes you to Google Maps, which is operated by
        Google under its own privacy policy. We do not control the information Google collects.
      </p>

      <h2>Retention</h2>
      <p>
        We keep information you send us only for as long as we need it for the purposes above or as
        required by law.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us to access, correct or delete personal information you have shared with us by
        contacting us using the details below.
      </p>

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

      <h2>Changes to this policy</h2>
      <p>We will update this page if the way this website handles information changes.</p>
    </LegalPage>
  );
}
