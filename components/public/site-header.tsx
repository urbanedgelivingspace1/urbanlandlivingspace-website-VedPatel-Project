"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandWordmark } from "@/components/foundation/brand-wordmark";
import type { PublicBusinessConfig } from "@/lib/config/public-business";
import { buildTelephoneUrl, buildWhatsAppUrl } from "@/lib/config/public-business";
import { LanguageSwitcher } from "@/components/public/language-switcher";
import { useLanguage } from "@/components/public/language-provider";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

import { ChevronIcon, CloseIcon, CompassIcon, LocationIcon, MenuIcon, PhoneIcon } from "./icons";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ config }: Readonly<{ config: PublicBusinessConfig }>) {
  const pathname = usePathname();
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const open = openPathname === pathname;
  const mobilePanel = useRef<HTMLElement>(null);
  const landTypesMenu = useRef<HTMLDetailsElement>(null);
  const locationsMenu = useRef<HTMLDetailsElement>(null);
  const whatsAppUrl = buildWhatsAppUrl(config);
  const telephoneUrl = buildTelephoneUrl(config);
  const { t } = useLanguage();
  const translatedPrimaryLinks = [
    { href: "/properties", label: t("nav.explore") },
    { href: "/guides", label: t("nav.guides") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ] as const;
  const translatedLandTypeLinks = [
    { href: "/agricultural-land", label: t("nav.agricultural") },
    { href: "/na-land", label: t("nav.na") },
    { href: "/industrial-land", label: t("nav.industrial") },
  ] as const;
  const translatedLocationLinks = [
    { href: "/locations/ahmedabad", label: t("common.ahmedabad") },
    { href: "/locations/gandhinagar", label: t("common.gandhinagar") },
  ] as const;
  const translatedTransactionLinks = [
    { href: "/buy", label: t("nav.buy") },
    { href: "/rent", label: t("nav.rent") },
    { href: "/lease", label: t("nav.lease") },
  ] as const;

  const closeNavigation = useCallback(() => {
    setOpenPathname(null);
    landTypesMenu.current?.removeAttribute("open");
    locationsMenu.current?.removeAttribute("open");
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  useEffect(() => {
    const closeDesktopMenusOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (landTypesMenu.current?.open && !landTypesMenu.current.contains(target)) {
        landTypesMenu.current.removeAttribute("open");
      }
      if (locationsMenu.current?.open && !locationsMenu.current.contains(target)) {
        locationsMenu.current.removeAttribute("open");
      }
    };

    document.addEventListener("pointerdown", closeDesktopMenusOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeDesktopMenusOutsidePointer);
  }, []);
  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = mobilePanel.current;
    panel?.querySelector<HTMLElement>("a,button")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeNavigation();
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
  }, [open, closeNavigation]);
  return (
    <header className="site-header">
      <div
        className="site-container site-container-wide site-header-inner flex items-center justify-between gap-4"
        inert={open ? true : undefined}
      >
        <Link href="/" className="shrink-0" aria-label={t("nav.home")}>
          <BrandWordmark compact />
        </Link>

        <nav aria-label="Primary navigation" className="site-primary-nav items-center gap-1">
          <Link
            aria-current={isActive(pathname, "/properties") ? "page" : undefined}
            className="nav-link"
            href="/properties"
          >
            {t("nav.explore")}
          </Link>
          <details
            className="nav-menu"
            key={`land-types-${pathname}`}
            ref={landTypesMenu}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              event.preventDefault();
              event.currentTarget.removeAttribute("open");
              event.currentTarget.querySelector<HTMLElement>("summary")?.focus();
            }}
          >
            <summary className="nav-link">{t("nav.landTypes")}</summary>
            <div>
              {translatedLandTypeLinks.map((link) => (
                <Link href={link.href} key={link.href} onClick={closeNavigation}>
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
          <details
            className="nav-menu"
            key={`locations-${pathname}`}
            ref={locationsMenu}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              event.preventDefault();
              event.currentTarget.removeAttribute("open");
              event.currentTarget.querySelector<HTMLElement>("summary")?.focus();
            }}
          >
            <summary className="nav-link">{t("nav.locations")}</summary>
            <div>
              {translatedLocationLinks.map((link) => (
                <Link href={link.href} key={link.href} onClick={closeNavigation}>
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
          {translatedPrimaryLinks.slice(1).map((link) => (
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

        <div className="site-header-actions items-center gap-2">
          <LanguageSwitcher compact />
          <Link className="button button-gold button-compact" href="/sell-your-land">
            {t("nav.sell")}
          </Link>
          {whatsAppUrl ? (
            <a
              className="header-contact whatsapp-contact"
              href={whatsAppUrl}
              rel="noreferrer"
              target="_blank"
              aria-label={t("contact.whatsapp")}
            >
              <WhatsAppIcon className="size-5" />
            </a>
          ) : null}
          {telephoneUrl ? (
            <a className="header-contact" href={telephoneUrl} aria-label={t("contact.call")}>
              <PhoneIcon className="size-5" />
            </a>
          ) : null}
        </div>

        <button
          type="button"
          className="menu-trigger"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? t("nav.close") : t("nav.open")}
          onClick={() => setOpenPathname((value) => (value === pathname ? null : pathname))}
        >
          <MenuIcon className="size-5" />
        </button>
      </div>

      {open ? (
        <div className="mobile-nav-backdrop" onClick={closeNavigation}>
          <section
            aria-labelledby="mobile-navigation-title"
            aria-modal="true"
            className="mobile-nav-panel"
            ref={mobilePanel}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="mobile-nav-heading">
              <div>
                <p className="mobile-nav-kicker">UrbanEdge Land Space</p>
                <h2 id="mobile-navigation-title">{t("nav.menu")}</h2>
              </div>
              <button
                type="button"
                className="mobile-nav-close"
                aria-label={t("nav.close")}
                onClick={closeNavigation}
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            <nav
              id="mobile-navigation"
              aria-label="Mobile navigation"
              className="mobile-nav-content"
            >
              <Link
                className="mobile-nav-primary"
                href="/properties"
                aria-current={isActive(pathname, "/properties") ? "page" : undefined}
                onClick={closeNavigation}
              >
                <span className="mobile-nav-primary-icon">
                  <CompassIcon className="size-5" />
                </span>
                <span>
                  <strong>{t("nav.exploreAll")}</strong>
                  <small>{t("nav.exploreHint")}</small>
                </span>
                <ChevronIcon className="size-4" />
              </Link>

              <section className="mobile-nav-section" aria-labelledby="mobile-transaction-title">
                <p className="mobile-nav-label" id="mobile-transaction-title">
                  {t("nav.intent")}
                </p>
                <div className="mobile-transaction-links">
                  {translatedTransactionLinks.map((link) => (
                    <Link
                      aria-current={isActive(pathname, link.href) ? "page" : undefined}
                      href={link.href}
                      key={link.href}
                      onClick={closeNavigation}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="mobile-nav-section" aria-labelledby="mobile-land-title">
                <p className="mobile-nav-label" id="mobile-land-title">
                  {t("nav.landTypePrompt")}
                </p>
                <div className="mobile-nav-list">
                  {translatedLandTypeLinks.map((link) => (
                    <Link
                      aria-current={isActive(pathname, link.href) ? "page" : undefined}
                      className="mobile-nav-link"
                      href={link.href}
                      key={link.href}
                      onClick={closeNavigation}
                    >
                      <span>{link.label}</span>
                      <ChevronIcon className="size-4" />
                    </Link>
                  ))}
                </div>
              </section>

              <section className="mobile-nav-section" aria-labelledby="mobile-location-title">
                <p className="mobile-nav-label" id="mobile-location-title">
                  {t("nav.popularLocations")}
                </p>
                <div className="mobile-location-links">
                  {translatedLocationLinks.map((link) => (
                    <Link
                      aria-current={isActive(pathname, link.href) ? "page" : undefined}
                      href={link.href}
                      key={link.href}
                      onClick={closeNavigation}
                    >
                      <LocationIcon className="size-4" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="mobile-nav-section" aria-labelledby="mobile-more-title">
                <p className="mobile-nav-label" id="mobile-more-title">
                  {t("nav.more")}
                </p>
                <div className="mobile-secondary-links">
                  {translatedPrimaryLinks.slice(1).map((link) => (
                    <Link
                      aria-current={isActive(pathname, link.href) ? "page" : undefined}
                      href={link.href}
                      key={link.href}
                      onClick={closeNavigation}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>

              <div className="mobile-sell-wrapper">
                <Link
                  aria-current={isActive(pathname, "/sell-your-land") ? "page" : undefined}
                  className="mobile-sell-link"
                  href="/sell-your-land"
                  onClick={closeNavigation}
                >
                  <span>
                    <strong>{t("nav.sellPrompt")}</strong>
                    <small>{t("nav.sellHint")}</small>
                  </span>
                  <ChevronIcon className="size-4" />
                </Link>
              </div>
            </nav>

            <div className="mobile-language-row">
              <LanguageSwitcher />
            </div>

            <div className="mobile-nav-contact" aria-label="Contact UrbanEdge">
              {whatsAppUrl ? (
                <a
                  className="whatsapp-contact"
                  href={whatsAppUrl}
                  rel="noreferrer"
                  target="_blank"
                  onClick={closeNavigation}
                >
                  <WhatsAppIcon className="size-4" />
                  <span>{t("nav.whatsapp")}</span>
                </a>
              ) : (
                <span aria-disabled="true">{t("nav.whatsapp")}</span>
              )}
              {telephoneUrl ? (
                <a href={telephoneUrl} onClick={closeNavigation}>
                  <PhoneIcon className="size-4" />
                  <span>{t("nav.call")}</span>
                </a>
              ) : (
                <span aria-disabled="true">{t("nav.call")}</span>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </header>
  );
}
