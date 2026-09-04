"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandWordmark } from "@/components/foundation/brand-wordmark";
import type { PublicBusinessConfig } from "@/lib/config/public-business";
import { buildTelephoneUrl, buildWhatsAppUrl } from "@/lib/config/public-business";

import { CloseIcon, MenuIcon, MessageIcon, PhoneIcon } from "./icons";

const links = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Explore Land" },
  { href: "/agricultural-land", label: "Agricultural" },
  { href: "/na-land", label: "NA Land" },
  { href: "/industrial-land", label: "Industrial" },
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

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-container flex min-h-20 items-center justify-between gap-5">
        <Link href="/" className="shrink-0">
          <BrandWordmark />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 xl:flex">
          {links.map((link) => (
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
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow text-[var(--brand-gold)]">Explore UrbanEdge</p>
            <div className="mt-4 grid gap-1">
              {links.map((link) => (
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
              <Link
                className="mobile-nav-link"
                href="/sell-your-land"
                onClick={() => setOpen(false)}
                prefetch={false}
              >
                Sell Your Land
              </Link>
              <Link
                className="mobile-nav-link"
                href="/guides"
                onClick={() => setOpen(false)}
                prefetch={false}
              >
                Guides
              </Link>
              <Link
                className="mobile-nav-link"
                href="/about"
                onClick={() => setOpen(false)}
                prefetch={false}
              >
                About
              </Link>
              <Link
                className="mobile-nav-link"
                href="/contact"
                onClick={() => setOpen(false)}
                prefetch={false}
              >
                Contact
              </Link>
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
