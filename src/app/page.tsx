import type { CSSProperties } from "react";
import Image from "next/image";
import { IntroOverlay } from "@/components/IntroOverlay";
import { JourneyCanvas } from "@/components/JourneyCanvas";
import { JourneyController } from "@/components/JourneyController";
import { RevealObserver } from "@/components/RevealObserver";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { about, company, contact, hero, properties, services, whyChooseUs } from "@/lib/content";

const container = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10";
const pad2 = (n: number) => String(n).padStart(2, "0");

export default function Home() {
  return (
    <>
      <SiteHeader onHome />
      <IntroOverlay />
      <main id="main">
        <JourneyController>
          {/* Pinned stage: the 3D view with the hero and service copy laid over
              it. Each block fades in while its spacer below is in view. */}
          <div className="journey-stage">
            <JourneyCanvas />
            <div className="journey-scrim" aria-hidden="true" />

            <div className="journey-blocks">
              <section data-step-text aria-labelledby="hero-title" className="stage-block stage-block--hero">
                <div className={container}>
                  <div className="stage-backdrop max-w-[760px]">
                    <p className="eyebrow hero-fade" style={{ "--d": "0ms" } as CSSProperties}>
                      Facility management · {hero.location}
                    </p>
                    <h1
                      id="hero-title"
                      className="mt-5 font-display text-[clamp(2.3rem,4.6vw,4.25rem)] leading-[0.98] font-semibold tracking-[0.01em] uppercase"
                    >
                      {hero.titleLines.map((line, i) => (
                        <span key={line} className="hero-line">
                          <span style={{ "--i": i } as CSSProperties}>{line}</span>
                        </span>
                      ))}
                    </h1>
                    <p className="hero-fade mt-6 text-lg font-semibold md:text-xl" style={{ "--d": "450ms" } as CSSProperties}>
                      {hero.subline}
                    </p>
                    <p
                      className="hero-fade stage-muted mt-3 max-w-[540px] leading-relaxed max-sm:hidden"
                      style={{ "--d": "550ms" } as CSSProperties}
                    >
                      {hero.summary}
                    </p>
                    <div className="hero-fade mt-8 flex flex-wrap gap-3" style={{ "--d": "650ms" } as CSSProperties}>
                      <a href="#services" className="btn btn-on-stage">
                        {hero.cta}
                        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                          <path d="M7 1v12M1 7l6 6 6-6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                      </a>
                      <a href={company.phoneHref} className="btn btn-ghost-on-stage">
                        Call {company.phoneDisplay}
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              <h2 className="sr-only">Our Services</h2>
              {services.map((service, i) => (
                <article
                  key={service.id}
                  data-step-text
                  aria-labelledby={`${service.id}-title`}
                  className="stage-block"
                >
                  <div className={container}>
                    <div className="stage-copy stage-backdrop">
                      <p className="eyebrow" aria-hidden="true">
                        Our Services
                      </p>
                      <div className="mt-4 flex items-baseline gap-4">
                        <span className="font-display text-2xl font-medium text-gold tabular-nums" aria-hidden="true">
                          {pad2(i + 1)}
                        </span>
                        <h3
                          id={`${service.id}-title`}
                          className="font-display text-[clamp(1.9rem,3.2vw,2.9rem)] leading-[1.05] font-medium"
                        >
                          {service.title}
                        </h3>
                      </div>
                      <p className="stage-muted mt-4 max-w-[52ch] leading-relaxed">{service.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="journey-progress" aria-hidden="true">
              <span data-journey-progress />
            </div>
            <p data-scroll-cue className="journey-cue" aria-hidden="true">
              (Scroll to discover)
            </p>
          </div>

          {/* Scroll length and anchors for each step of the journey. */}
          <div id="top" data-journey-step="hero" className="journey-spacer journey-spacer--hero" />
          <div id="services">
            {services.map((service) => (
              <div key={service.id} id={service.id} data-journey-step={service.id} className="journey-spacer" />
            ))}
          </div>
        </JourneyController>

        <section id="about" aria-labelledby="about-title" className="relative z-10 bg-ivory py-24 md:py-32">
          <div className={`${container} grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20`}>
            <div>
              <h2 id="about-title" className="eyebrow reveal">
                {about.heading}
              </h2>
              <p className="reveal mt-6 font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.15] font-medium">
                {about.lead}
              </p>
            </div>
            <div className="lg:pt-12">
              {about.body.map((p) => (
                <p key={p} className="reveal leading-relaxed text-muted">
                  {p}
                </p>
              ))}
              <p className="reveal mt-8 font-semibold">{about.strengthIntro}</p>
              <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
                {about.strengths.map((s, i) => (
                  <li
                    key={s}
                    className="reveal flex items-baseline gap-3 border-t border-line py-3"
                    style={{ "--reveal-delay": `${i * 60}ms` } as CSSProperties}
                  >
                    <span className="text-xs font-semibold text-gold-deep tabular-nums" aria-hidden="true">
                      {pad2(i + 1)}
                    </span>
                    <span className="first-letter:uppercase">
                      {s}
                      {i === about.strengths.length - 1 ? "." : ""}
                    </span>
                  </li>
                ))}
              </ul>
              {about.closing.map((p) => (
                <p key={p} className="reveal mt-6 leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section
          id="properties"
          aria-labelledby="properties-title"
          className="relative z-10 border-t border-line bg-stone py-24 md:py-32"
        >
          <div className={container}>
            <h2
              id="properties-title"
              className="reveal font-display text-[clamp(2.2rem,4vw,3.25rem)] leading-none font-medium"
            >
              Managed Properties
            </h2>
            <ul className="mt-12 grid sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((name, i) => (
                <li
                  key={`${name}-${i}`}
                  className="reveal flex min-h-14 items-center border-t border-line text-sm font-semibold tracking-[0.12em]"
                  style={{ "--reveal-delay": `${(i % 4) * 50}ms` } as CSSProperties}
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="why-us" aria-labelledby="why-title" className="relative z-10 bg-ivory py-24 md:py-32">
          <div className={container}>
            <h2
              id="why-title"
              className="reveal max-w-[900px] font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.08] font-medium"
            >
              {whyChooseUs.heading}
            </h2>
            <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {whyChooseUs.points.map((point, i) => (
                <li
                  key={point}
                  className="reveal border-t-2 border-gold pt-5"
                  style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}
                >
                  <p className="text-xs font-semibold text-gold-deep tabular-nums" aria-hidden="true">
                    {pad2(i + 1)}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-tight font-medium">{point}</h3>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="contact"
          aria-labelledby="contact-title"
          className="on-dark relative z-10 bg-ink py-24 text-ivory md:py-32"
        >
          <div className={container}>
            <p className="eyebrow">Contact</p>
            <h2
              id="contact-title"
              className="reveal mt-5 max-w-[820px] font-display text-[clamp(2.2rem,4.4vw,3.75rem)] leading-[1.05] font-medium"
            >
              {contact.heading}
            </h2>
            <dl className="mt-14 grid gap-10 border-t border-line-dark pt-10 md:grid-cols-3">
              <div>
                <dt className="eyebrow">Phone</dt>
                <dd className="mt-3">
                  <a
                    href={company.phoneHref}
                    className="inline-flex min-h-11 items-center font-display text-3xl font-medium hover:text-gold"
                  >
                    {company.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Email</dt>
                <dd className="mt-3">
                  <a
                    href={`mailto:${company.email}`}
                    className="inline-flex min-h-11 items-center text-lg font-medium break-all hover:text-gold"
                  >
                    {company.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Office</dt>
                <dd className="mt-3">
                  <address className="text-lg leading-relaxed not-italic">{company.address}</address>
                  <a
                    href={company.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold underline-offset-4 hover:underline"
                  >
                    Open in Google Maps
                    <span className="sr-only">(opens in a new tab)</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M4 1h7v7M11 1L1 11" stroke="currentColor" strokeWidth="1.4" fill="none" />
                    </svg>
                  </a>
                </dd>
              </div>
            </dl>
            <Image
              src="/brand/logo-on-dark.webp"
              alt={company.name}
              width={1400}
              height={357}
              className="mt-20 h-12 w-auto opacity-90 sm:h-14"
            />
          </div>
        </section>
      </main>
      <SiteFooter showContact={false} />
      <RevealObserver />
    </>
  );
}
