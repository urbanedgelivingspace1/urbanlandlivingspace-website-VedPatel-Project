"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandWordmark } from "@/components/foundation/brand-wordmark";
import type { PublicBusinessConfig } from "@/lib/config/public-business";
import { buildTelephoneUrl, buildWhatsAppUrl } from "@/lib/config/public-business";

import { CloseIcon, MenuIcon, MessageIcon, PhoneIcon } from "./icons";

const primaryLinks = [
  { href: "/properties", label: "Explore Land" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

const landTypeLinks = [
  { href: "/agricultural-land", label: "Agricultural Land" },
  { href: "/na-land", label: "NA Land" },
  { href: "/industrial-land", label: "Industrial Land" },
] as const;

const locationLinks = [
  { href: "/locations/ahmedabad", label: "Ahmedabad" },
  { href: "/locations/gandhinagar", label: "Gandhinagar" },
] as const;

const transactionLinks = [
  { href: "/buy", label: "Buy" },
  { href: "/rent", label: "Rent" },
  { href: "/lease", label: "Lease" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ config }: Readonly<{ config: PublicBusinessConfig }>) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mobilePanel = useRef<HTMLElement>(null);
  const whatsAppUrl = buildWhatsAppUrl(config);
  const telephoneUrl = buildTelephoneUrl(config);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = mobilePanel.current;
    panel?.querySelector<HTMLElement>("a,button")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>("a,button")];
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus();
    };
  }, [open]);
  return (
    <header className="site-header">
      <div className="site-container flex min-h-20 items-center justify-between gap-5">
        <Link href="/" className="shrink-0" aria-label="UrbanEdge Land Space home">
          <BrandWordmark compact />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 xl:flex">
          <Link
            aria-current={isActive(pathname, "/properties") ? "page" : undefined}
            className="nav-link"
            href="/properties"
          >
            Explore Land
          </Link>
          <details className="nav-menu">
            <summary className="nav-link">Land Types</summary>
            <div>
              {landTypeLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
          <details className="nav-menu">
            <summary className="nav-link">Locations</summary>
            <div>
              {locationLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
          {primaryLinks.slice(1).map((link) => (
            <Link
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className="nav-link"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Link
            className="button button-gold button-compact"
            href="/sell-your-land"
            prefetch={false}
          >
            Sell Your Land
          </Link>
          {whatsAppUrl ? (
            <a
              className="header-contact"
              href={whatsAppUrl}
              rel="noreferrer"
              target="_blank"
              aria-label="Contact UrbanEdge on WhatsApp"
            >
              <MessageIcon className="size-5" />
            </a>
          ) : null}
          {telephoneUrl ? (
            <a className="header-contact" href={telephoneUrl} aria-label="Call UrbanEdge">
              <PhoneIcon className="size-5" />
            </a>
          ) : null}
        </div>

        <button
          type="button"
          className="menu-trigger xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
        </button>
      </div>

      {open ? (
        <div className="mobile-nav-backdrop xl:hidden" onClick={() => setOpen(false)}>
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="mobile-nav-panel"
            ref={mobilePanel}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow text-[var(--brand-gold)]">Explore UrbanEdge</p>
            <div className="mt-4 grid gap-1">
              <Link
                className="mobile-nav-link"
                href="/properties"
                aria-current={isActive(pathname, "/properties") ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                Explore Land
              </Link>
              <p className="mobile-nav-label">Land types</p>
              {landTypeLinks.map((link) => (
                <Link
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className="mobile-nav-link"
                  href={link.href}
                  key={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <p className="mobile-nav-label">Locations</p>
              {locationLinks.map((link) => (
                <Link
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className="mobile-nav-link"
                  href={link.href}
                  key={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <p className="mobile-nav-label">Buy, rent or lease</p>
              <div className="mobile-transaction-links">
                {transactionLinks.map((link) => (
                  <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>
              <Link
                className="mobile-nav-link"
                href="/sell-your-land"
                onClick={() => setOpen(false)}
                prefetch={false}
              >
                Sell Your Land
              </Link>
              {primaryLinks.slice(1).map((link) => (
                <Link
                  className="mobile-nav-link"
                  href={link.href}
                  key={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-5">
              {whatsAppUrl ? (
                <a className="button button-gold button-compact" href={whatsAppUrl}>
                  <MessageIcon className="size-4" /> WhatsApp
                </a>
              ) : (
                <span className="button button-disabled button-compact" aria-disabled="true">
                  WhatsApp
                </span>
              )}
              {telephoneUrl ? (
                <a className="button button-outline-light button-compact" href={telephoneUrl}>
                  <PhoneIcon className="size-4" /> Call
                </a>
              ) : (
                <span className="button button-disabled button-compact" aria-disabled="true">
                  Call
                </span>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
