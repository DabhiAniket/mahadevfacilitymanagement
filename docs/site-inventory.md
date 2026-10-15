# Site inventory: www.mahadevfacilitymanagement.com

Captured 2026-10-15 from the live Wix site. Text below is verbatim. I rendered each page in headless Chrome and extracted the DOM text, image tags, links, meta tags and computed colours. Full-page screenshots at 1440, 834 and 390 px are in `docs/live-site/`.

## Platform

- Wix. No source repository, forms, APIs or custom code to preserve.
- Wix sitemap lists: `/home`, `/` , `/services-7`, `/privacy-policy`, `/accessibility-statement`. It also references Wix Stores product and category sitemaps, but no store pages are linked from the site.
- The new site keeps every route: `/home` and `/services-7` redirect (308) to `/` and `/#services`; `/privacy-policy` and `/accessibility-statement` exist as new pages.

## Brand assets found

| Asset | Source | Notes |
| --- | --- | --- |
| Logo, square 5001x5001 JPEG | Wix favicon (`bc5037_4cc8d697...~mv2.jpg`) | Gold shield with house mark and "MFM", white serif wordmark, gold tracked "PRIVATE LIMITED", on black. Copy in `docs/source-assets/logo-square-original.jpg`. |
| Logo, banner 3000x782 JPEG | Home hero image (`bc5037_05b63195...~mv2.jpg`, alt "123-02_edited.jpg") | Same artwork. Copy in `docs/source-assets/logo-banner-original.jpg`. |
| Services page background | `a3c153_a0c884d8...~mv2.jpg` | Wix stock aerial photo of ice and sand. Not related to the business. **Not used.** |
| Social icons | Wix stock icons | Linked to Wix's own Instagram, LinkedIn and TikTok. **Not used.** |

No photographs of managed properties, staff or services exist on the site.

### Colours

- Logo gold sampled from the source file: **#C8A060** (dominant cluster; anti-aliased edges range #A88850 to #D0A864).
- Site UI computed colours: background `rgb(0,0,0)`, text `rgb(255,255,255)`. Accent `#622737` (maroon) on the "Why Choose" icons. Wix theme defaults `#116DFF` / `#5E97FF` appear only in Wix system UI.

### Fonts on the live site

Oswald (headings), Futura LT (body), DIN Next (Wix UI). The logo wordmark is a flared serif that I could not identify with certainty, so I have not named it.

## Home page (`/home`), in order

1. **Hero**: logo banner image. Heading "Crafting Exceptional Environments for Modern Living". Subline "Elevating Residential Living and Working Spaces". Button "Explore Our Services" (links to `/services-7`).
2. **About us**: one paragraph:
   > Mahadev Facility Management Private Limited is a professionally managed and trusted facility management company committed to delivering reliable, high-quality, and cost-effective services. Backed by experienced management, trained manpower, and strong operational systems, we specialize in comprehensive society management, housekeeping, garden maintenance, swimming pool maintenance, and allied facility services. Our core strength lies in our disciplined workforce, customer-centric approach, transparent processes, and strict quality control standards. With a clear focus on safety, hygiene, and long-term value, we partner with residential societies, commercial complexes, and corporate establishments to ensure smooth day-to-day operations and a clean, secure, and well-maintained environment. Our dedication, responsiveness, and consistent service delivery make us a dependable name in facility management.
3. **MANAGED PROPERTIES**: 26 entries, separated by " - ":
   VASANT KUNJ, OSCAR SKY PARK, MALABAR HILLS, DECORA SKY HILLS, RUKSHMANI HEIGHTS, AQUA MAJESTIC, AQUA CORAL, WHITE HEAVEN, COSMOS PRIDE, PENTAGON TOWERS, TULSI IMPERIA, SHYAMAL UPVAN, SHYAMAL SATVA, KASTURI CASA, ASOPALAV LUXURIA, ASOPALAV ENIGMA, SWASTIK HIGHLANDS, KRUTI ONELLA, KRUTI ONELLA COMERCIAL, PEARL AVENUE, MARWADI UNIVERSITY, NILKANTH PLAZA, THE GRAND PALACE, DECORA SQUARE, GREENFIELD GARDENS, NEELKANTH PLAZA
4. **Why Choose Mahadev Facility Management Private Limited**: four headings, no body text: Excellence in Management; Sustainability Commitment; Innovative Solutions; Client-Centric Approach.
5. **Footer**: Mahadev Facility Management Private Limited; 8140745807; info@mahadevfacilitymanagement.com (mailto); 1009-The Imperia, Opp. Shashtri Medan, Rajkot - 360001; social icons (Wix links); "© 2023 by Mahadev Facility Management Private Limited. All rights reserved."

## Services page (`/services-7`), in order

Heading "Our Services", then six numbered items:

1. **Society Management Services**: Our administrative services are designed to relieve the Managing Committee of daily operational burdens by establishing a professional, organized framework for society governance. We appoint dedicated onsite managers to implement structured workflows, handle regulatory compliance, and ensure seamless communication between residents and the administration.
2. **Housekeeping Services**: We are committed to maintaining the highest standards of hygiene and cleanliness across your entire property. Our trained staff and supervisors manage the upkeep of all common areas from the main gate to individual doorsteps using high-quality materials and systematic cleaning schedules to create a pristine living environment.
3. **Garden Maintenance Service**: Our landscaping services aim to remove the burden of maintenance while maximizing the aesthetic beauty of your green spaces. We provide a skilled team equipped with the necessary machinery and fertilizers to manage everything from lawn cutting to weed control, ensuring your garden remains a serene and well-groomed retreat year-round.
4. **Swimming Pool Maintenance**: Proper pool maintenance is critical for hygiene and resident safety, which is why we entrust this task to experts. Our team handles the rigorous routine of cleaning, chemical balancing, and pH level monitoring to repel bacteria and ensure your swimming pool remains crystal clear and safe for use.
5. **Water Tank Cleaning**: Our water tank cleaning service ensures that your storage is free from contaminants and buildup, promoting safe and clean water for your household. With our team and advanced techniques, you can trust that your tank will be thoroughly cleaned and maintained for optimal performance.
6. **Residential Unit Deep Cleaning**: Experience a thorough transformation with our Residential Unit Deep Cleaning service, designed to leave your home spotless and refreshing. Our dedicated team uses top-notch cleaning techniques and nature friendly products to ensure every corner sparkles, providing you with a clean and healthy living environment.

Then "Get in touch for a free site analysis!" and the same footer.

## Privacy policy (`/privacy-policy`)

Wix's template text ("A legal disclaimer... how to write your own document of a Privacy Policy"). **It is not a privacy policy.** Footer also shows "Built with Interactive Studio" and "Installed Apps: Aura Suite".

## Accessibility statement (`/accessibility-statement`)

Wix template with unfilled placeholders: "WCAG [2.0 / 2.1 / 2.2 - select relevant option]", "[A / AA / AAA - select relevant option]", "[enter relevant third-party name]", "[Name of the accessibility coordinator]", and similar. It also claims physical accessibility features (parking, elevators, audio induction systems) that I cannot verify. **Not carried over.**

## Metadata

- `<title>`: Mahadev Facility Management Private Limited
- `meta description` and `og:description`: "Facility & property management service provider in Gujarat with 15+ years of experience."
- `og:site_name`: **"My Site 1"** (template leftover). Subpage titles: "Services | My Site 1", "Privacy Policy | My Site 1".

## Issues and inconsistencies

| # | Issue | Handling in the new site |
| --- | --- | --- |
| 1 | NILKANTH PLAZA and NEELKANTH PLAZA both listed | Both kept, unchanged. **Needs confirmation**: same property or two? |
| 2 | "KRUTI ONELLA COMERCIAL" (likely "COMMERCIAL") | Kept verbatim. **Needs confirmation.** |
| 3 | "WHITE HEAVEN" (possibly "White Haven") | Kept verbatim. **Needs confirmation.** |
| 4 | "RUKSHMANI HEIGHTS" (possibly "Rukmani"/"Rukshmani") | Kept verbatim. **Needs confirmation.** |
| 5 | "Shashtri Medan" in the address (commonly written "Shastri Maidan") | Kept verbatim. **Needs confirmation.** |
| 6 | "Why Choose" headings have no body text | Shown as headings only. No text invented. |
| 7 | "15+ years of experience" appears only in meta tags, not on any page | **Not used** until confirmed. |
| 8 | `og:site_name` "My Site 1", copyright 2023 | Replaced with the company name; year is now dynamic. |
| 9 | Social icons link to Wix's accounts | Removed. Real profiles needed if wanted. |
| 10 | Homepage About lists 4 services; services page lists 6 | New site shows all 6 from the services page. |
| 11 | No contact form | None built. Waiting on a decision (see README). |
| 12 | Privacy policy and accessibility statement are unfilled templates | Replaced with drafts describing this site; marked "Draft" until approved. |
| 13 | Services page background is an unrelated stock photo | Not used. |
| 14 | Text has a trailing zero-width space after the About paragraph and in "MANAGED PROPERTIES" | Stripped. |
