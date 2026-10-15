import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SITE_URL, company } from "@/lib/content";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Mahadev Facility Management Private Limited, Rajkot: society management, housekeeping, garden maintenance, swimming pool maintenance, water tank cleaning and residential unit deep cleaning.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: company.name,
    template: `%s | ${company.name}`,
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: company.name,
    title: company.name,
    description,
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: company.name,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#17140f",
};

// Only facts published on the company's own site.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: company.name,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo-on-light.png`,
  image: `${SITE_URL}/brand/logo-on-light.png`,
  telephone: "+91 8140745807",
  email: company.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: company.addressParts.street,
    addressLocality: company.addressParts.locality,
    addressRegion: company.addressParts.region,
    postalCode: company.addressParts.postalCode,
    addressCountry: company.addressParts.country,
  },
};

// Runs before first paint:
// - html.js enables the scripted layout; without it the page is a plain document.
// - html.intro-done skips the home intro on other pages, for reduced motion,
//   for anchor links and for repeat visits in this session.
// - If the app has not hydrated after 9 s (script failure), drop back to the
//   plain document so no content stays hidden.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');
try{if(location.pathname!=='/'||location.hash.length>1||matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('mfm-intro-seen')==='1')d.classList.add('intro-done')}catch(e){d.classList.add('intro-done')}
if(location.pathname==='/')setTimeout(function(){if(!window.__mfmHydrated){d.classList.remove('js');d.classList.add('intro-done')}},9000)})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${cormorant.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
