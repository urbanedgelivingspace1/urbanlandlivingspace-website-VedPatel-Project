"use client";

import { useState } from "react";

import { useLanguage } from "@/components/public/language-provider";

const budgetRanges = {
  "": { min: "", max: "" },
  "under-50l": { min: "", max: "5000000" },
  "50l-1cr": { min: "5000000", max: "10000000" },
  "1cr-2cr": { min: "10000000", max: "20000000" },
  "2cr-5cr": { min: "20000000", max: "50000000" },
  "5cr-plus": { min: "50000000", max: "" },
} as const;

export function SearchEntryForm() {
  const { t } = useLanguage();
  const [budget, setBudget] = useState<keyof typeof budgetRanges>("");
  const range = budgetRanges[budget];
  return (
    <form action="/properties" method="get" className="search-entry-form">
      <label className="search-entry-field">
        <span>{t("search.location")}</span>
        <select name="district" defaultValue="" aria-label={t("search.location")}>
          <option value="">{t("search.allLocations")}</option>
          <option value="ahmedabad">{t("common.ahmedabad")}</option>
          <option value="gandhinagar">{t("common.gandhinagar")}</option>
        </select>
      </label>
      <label className="search-entry-field">
        <span>{t("search.landType")}</span>
        <select name="category" defaultValue="" aria-label={t("search.landType")}>
          <option value="">{t("search.allLandTypes")}</option>
          <option value="agricultural">{t("nav.agricultural")}</option>
          <option value="na">{t("nav.na")}</option>
          <option value="industrial">{t("nav.industrial")}</option>
        </select>
      </label>
      <label className="search-entry-field">
        <span>{t("search.transaction")}</span>
        <select name="transaction" defaultValue="" aria-label={t("search.transaction")}>
          <option value="">{t("search.allTransactions")}</option>
          <option value="buy">{t("nav.buy")}</option>
          <option value="rent">{t("nav.rent")}</option>
          <option value="lease">{t("nav.lease")}</option>
        </select>
      </label>
      <label className="search-entry-field">
        <span>{t("search.budget")}</span>
        <select
          aria-label={t("search.budget")}
          value={budget}
          onChange={(event) => setBudget(event.target.value as keyof typeof budgetRanges)}
        >
          <option value="">{t("search.anyBudget")}</option>
          <option value="under-50l">Up to ₹50 L</option>
          <option value="50l-1cr">₹50 L–₹1 Cr</option>
          <option value="1cr-2cr">₹1–2 Cr</option>
          <option value="2cr-5cr">₹2–5 Cr</option>
          <option value="5cr-plus">₹5 Cr+</option>
        </select>
      </label>
      <input type="hidden" name="minPrice" value={range.min} />
      <input type="hidden" name="maxPrice" value={range.max} />
      <button className="button button-gold" type="submit">
        {t("search.submit")}
      </button>
    </form>
  );
}
