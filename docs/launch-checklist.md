# Launch checklist

The site does not launch until every **Gate** item is ticked.

## Gates

- [ ] **Custom domain connected.** Point `www.mahadevfacilitymanagement.com` (and the apex domain, redirecting to `www`) at the new host, with HTTPS. Set `NEXT_PUBLIC_SITE_URL` to the final origin before building. Not done: needs hosting and DNS access.
- [x] **Favicon added.** `src/app/favicon.ico`, `icon.png` and `apple-icon.png`, generated from the real logo.
- [x] **No "Made with" tag.** No builder badge, no `generator` meta tag, and `poweredByHeader: false` removes the `X-Powered-By: Next.js` header (checked with `curl -I`). The Wix "Built with Interactive Studio" footer is gone with Wix.
- [ ] **Privacy policy page approved.** `/privacy-policy` exists as a draft that matches what the site does today. Needs company and legal review, then set `LEGAL_PAGES_APPROVED = true` in `src/lib/content.ts` to remove the draft banner.
- [ ] **Terms and conditions page approved.** `/terms-and-conditions` exists as a draft. The governing-law clause is a placeholder for the company to fill in. Same approval flag.

## Content to confirm before launch

- [ ] Nilkanth Plaza / Neelkanth Plaza: one property or two?
- [ ] Spellings: KRUTI ONELLA COMERCIAL, WHITE HEAVEN, RUKSHMANI HEIGHTS, "Shashtri Medan".
- [ ] Optional body text for the four "Why Choose" headings (real wording only).
- [ ] Whether "15+ years of experience" (in the old meta description only) is accurate and should be shown.
- [ ] Real social profile URLs, if icons are wanted.
- [ ] WhatsApp number, if a WhatsApp link is wanted.
- [ ] Contact form: yes or no, and where submissions go (Resend or Web3Forms).
- [ ] Vector logo file.
- [ ] Accessibility statement reviewed (same approval flag as the legal pages).

## Before switching DNS

- [ ] `npm run build` passes on the host.
- [ ] Test on at least one real iPhone and one mid-range Android phone (scroll through the services sequence, check heat and frame rate).
- [ ] Re-run Lighthouse against the deployed URL.
- [ ] Submit the new sitemap (`/sitemap.xml`) in Google Search Console.
- [ ] Confirm `/home` and `/services-7` redirect on the live domain.
