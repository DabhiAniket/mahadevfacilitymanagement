// Single source of truth for site copy.
// Every string marked "verbatim" was copied from the live Wix site
// (www.mahadevfacilitymanagement.com, captured 2026-10-15). Do not reword
// those strings without the company's approval. See docs/site-inventory.md.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mahadevfacilitymanagement.com"
).replace(/\/$/, "");

// Set to true only after the company has reviewed and approved the legal pages.
export const LEGAL_PAGES_APPROVED = false;

export const company = {
  name: "Mahadev Facility Management Private Limited", // verbatim
  shortName: "Mahadev Facility Management",
  phoneDisplay: "8140745807", // verbatim
  phoneHref: "tel:+918140745807",
  email: "info@mahadevfacilitymanagement.com", // verbatim
  address: "1009-The Imperia, Opp. Shashtri Medan, Rajkot - 360001", // verbatim
  addressParts: {
    street: "1009-The Imperia, Opp. Shashtri Medan",
    locality: "Rajkot",
    region: "Gujarat",
    postalCode: "360001",
    country: "IN",
  },
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("1009 The Imperia, Opp. Shashtri Medan, Rajkot 360001"),
} as const;

export const hero = {
  title: "Crafting Exceptional Environments for Modern Living", // verbatim
  titleLines: ["Crafting Exceptional", "Environments for", "Modern Living"],
  subline: "Elevating Residential Living and Working Spaces", // verbatim
  cta: "Explore Our Services", // verbatim
  // Not on the live site: a factual summary built only from the About and
  // Services text, added so the hero says concretely what the company does.
  summary:
    "Society management, housekeeping, garden and swimming pool maintenance, water tank cleaning and residential deep cleaning for residential societies, commercial complexes and corporate establishments.",
  location: "Rajkot, Gujarat",
};

// verbatim, split into its original sentences for readability
export const about = {
  heading: "About us",
  lead: "Mahadev Facility Management Private Limited is a professionally managed and trusted facility management company committed to delivering reliable, high-quality, and cost-effective services.",
  body: [
    "Backed by experienced management, trained manpower, and strong operational systems, we specialize in comprehensive society management, housekeeping, garden maintenance, swimming pool maintenance, and allied facility services.",
  ],
  strengthIntro: "Our core strength lies in our",
  strengths: [
    "disciplined workforce",
    "customer-centric approach",
    "transparent processes",
    "strict quality control standards",
  ],
  closing: [
    "With a clear focus on safety, hygiene, and long-term value, we partner with residential societies, commercial complexes, and corporate establishments to ensure smooth day-to-day operations and a clean, secure, and well-maintained environment.",
    "Our dedication, responsiveness, and consistent service delivery make us a dependable name in facility management.",
  ],
};

// verbatim from /services-7
export const services = [
  {
    id: "society-management",
    title: "Society Management Services",
    body: "Our administrative services are designed to relieve the Managing Committee of daily operational burdens by establishing a professional, organized framework for society governance. We appoint dedicated onsite managers to implement structured workflows, handle regulatory compliance, and ensure seamless communication between residents and the administration.",
  },
  {
    id: "housekeeping",
    title: "Housekeeping Services",
    body: "We are committed to maintaining the highest standards of hygiene and cleanliness across your entire property. Our trained staff and supervisors manage the upkeep of all common areas from the main gate to individual doorsteps using high-quality materials and systematic cleaning schedules to create a pristine living environment.",
  },
  {
    id: "garden-maintenance",
    title: "Garden Maintenance Service",
    body: "Our landscaping services aim to remove the burden of maintenance while maximizing the aesthetic beauty of your green spaces. We provide a skilled team equipped with the necessary machinery and fertilizers to manage everything from lawn cutting to weed control, ensuring your garden remains a serene and well-groomed retreat year-round.",
  },
  {
    id: "swimming-pool-maintenance",
    title: "Swimming Pool Maintenance",
    body: "Proper pool maintenance is critical for hygiene and resident safety, which is why we entrust this task to experts. Our team handles the rigorous routine of cleaning, chemical balancing, and pH level monitoring to repel bacteria and ensure your swimming pool remains crystal clear and safe for use.",
  },
  {
    id: "water-tank-cleaning",
    title: "Water Tank Cleaning",
    body: "Our water tank cleaning service ensures that your storage is free from contaminants and buildup, promoting safe and clean water for your household. With our team and advanced techniques, you can trust that your tank will be thoroughly cleaned and maintained for optimal performance.",
  },
  {
    id: "residential-deep-cleaning",
    title: "Residential Unit Deep Cleaning",
    body: "Experience a thorough transformation with our Residential Unit Deep Cleaning service, designed to leave your home spotless and refreshing. Our dedicated team uses top-notch cleaning techniques and nature friendly products to ensure every corner sparkles, providing you with a clean and healthy living environment.",
  },
] as const;

// verbatim, in the live site's order. Spellings and the Nilkanth/Neelkanth
// pair are intentionally unchanged until the company confirms them.
export const properties = [
  "VASANT KUNJ",
  "OSCAR SKY PARK",
  "MALABAR HILLS",
  "DECORA SKY HILLS",
  "RUKSHMANI HEIGHTS",
  "AQUA MAJESTIC",
  "AQUA CORAL",
  "WHITE HEAVEN",
  "COSMOS PRIDE",
  "PENTAGON TOWERS",
  "TULSI IMPERIA",
  "SHYAMAL UPVAN",
  "SHYAMAL SATVA",
  "KASTURI CASA",
  "ASOPALAV LUXURIA",
  "ASOPALAV ENIGMA",
  "SWASTIK HIGHLANDS",
  "KRUTI ONELLA",
  "KRUTI ONELLA COMERCIAL",
  "PEARL AVENUE",
  "MARWADI UNIVERSITY",
  "NILKANTH PLAZA",
  "THE GRAND PALACE",
  "DECORA SQUARE",
  "GREENFIELD GARDENS",
  "NEELKANTH PLAZA",
];

export const whyChooseUs = {
  heading: "Why Choose Mahadev Facility Management Private Limited", // verbatim
  // verbatim headings; the live site has no body text for these
  points: [
    "Excellence in Management",
    "Sustainability Commitment",
    "Innovative Solutions",
    "Client-Centric Approach",
  ],
};

export const contact = {
  heading: "Get in touch for a free site analysis!", // verbatim from /services-7
};

export const navItems = [
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "properties", label: "Properties" },
  { id: "why-us", label: "Why Choose Us" },
  { id: "contact", label: "Contact" },
] as const;

export const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/accessibility-statement", label: "Accessibility Statement" },
] as const;
