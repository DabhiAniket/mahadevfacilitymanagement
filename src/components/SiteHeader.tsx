"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { company, navItems } from "@/lib/content";

type Props = {
  /** On the home page links are plain hashes; elsewhere they point back to /. */
  onHome?: boolean;
};

export function SiteHeader({ onHome = false }: Props) {
  const [open, setOpen] = useState(false);
  // Over the 3D stage the header is transparent with light text; over the
  // light content sections it becomes a solid bar.
  const [overStage, setOverStage] = useState(onHome);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  useEffect(() => {
    if (!onHome) return;
    const journey = document.getElementById("journey");
    if (!journey) return;
    const onScroll = () => setOverStage(journey.getBoundingClientRect().bottom > 72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onHome]);

  // While the menu is open: Escape closes it, and the page behind is inert so
  // focus stays inside the menu.
  useEffect(() => {
    if (!open) return;
    const behind = [document.getElementById("main"), document.querySelector("footer")].filter(
      (el): el is HTMLElement => !!el,
    );
    behind.forEach((el) => el.setAttribute("inert", ""));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      behind.forEach((el) => el.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const light = overStage && !open;

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,opacity] duration-300 ${
        open
          ? "on-dark border-line-dark bg-ink"
          : light
            ? "border-transparent bg-gradient-to-b from-ink/45 to-transparent"
            : "border-line bg-ivory/95 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto grid h-[var(--header-h)] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <div>
          <button
            ref={buttonRef}
            type="button"
            className={`inline-flex min-h-11 items-center gap-3 rounded-[2px] px-4 text-xs font-semibold tracking-[0.18em] uppercase transition-colors ${
              open
                ? "border border-line-dark text-ivory"
                : light
                  ? "bg-ink/60 text-ivory backdrop-blur-sm hover:bg-ink/75"
                  : "border border-ink/20 text-ink hover:border-ink"
            }`}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
              {open ? (
                <path d="M3 0l10 10M13 0L3 10" stroke="currentColor" strokeWidth="1.5" />
              ) : (
                <path d="M0 1h16M0 9h16" stroke="currentColor" strokeWidth="1.5" />
              )}
            </svg>
            {open ? "Close" : "Menu"}
          </button>
        </div>

        <Link
          href={onHome ? "#top" : "/"}
          className="flex min-h-11 items-center"
          aria-label={`${company.name}, home`}
          onClick={() => setOpen(false)}
        >
          <Image
            src={light || open ? "/brand/logo-on-dark.webp" : "/brand/logo-on-light.webp"}
            alt=""
            width={1400}
            height={357}
            priority
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        <div className="flex justify-end">
          <a
            href={company.phoneHref}
            className={`btn hidden sm:inline-flex ${light || open ? "bg-ivory text-ink hover:bg-paper" : "btn-primary"}`}
          >
            Call {company.phoneDisplay}
          </a>
          <a
            href={company.phoneHref}
            aria-label={`Call ${company.phoneDisplay}`}
            className={`inline-flex size-11 items-center justify-center rounded-[2px] sm:hidden ${
              light || open ? "bg-ivory text-ink" : "bg-ink text-ivory"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id={menuId}
            aria-label="Main"
            className="on-dark fixed inset-x-0 top-[var(--header-h)] bottom-0 overflow-y-auto bg-ink text-ivory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr] md:py-16 lg:px-10">
              <ul>
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.05 + i * 0.04, duration: 0.35 }}
                  >
                    <a
                      href={href(item.id)}
                      onClick={() => setOpen(false)}
                      className="flex min-h-14 items-center border-b border-line-dark font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight font-medium hover:text-gold"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="text-[0.95rem] text-muted-on-dark md:pt-3">
                <p className="eyebrow">Contact</p>
                <a href={company.phoneHref} className="mt-4 flex min-h-11 items-center text-xl text-ivory hover:text-gold">
                  {company.phoneDisplay}
                </a>
                <a href={`mailto:${company.email}`} className="flex min-h-11 items-center break-all text-ivory hover:text-gold">
                  {company.email}
                </a>
                <p className="mt-3 max-w-[30ch] leading-relaxed">{company.address}</p>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
