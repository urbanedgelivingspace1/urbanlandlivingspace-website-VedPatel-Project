"use client";

import { useState } from "react";

const budgetRanges = {
  "": { min: "", max: "" },
  "under-50l": { min: "", max: "5000000" },
  "50l-1cr": { min: "5000000", max: "10000000" },
  "1cr-2cr": { min: "10000000", max: "20000000" },
  "2cr-5cr": { min: "20000000", max: "50000000" },
  "5cr-plus": { min: "50000000", max: "" },
} as const;

export function SearchEntryForm() {
  const [budget, setBudget] = useState<keyof typeof budgetRanges>("");
  const range = budgetRanges[budget];
  return (
    <form action="/properties" method="get" className="search-entry-form">
      <label className="search-entry-field">
        <span>Location</span>
        <select name="district" defaultValue="" aria-label="Location">
          <option value="">Ahmedabad or Gandhinagar</option>
          <option value="ahmedabad">Ahmedabad</option>
          <option value="gandhinagar">Gandhinagar</option>
        </select>
      </label>
      <label className="search-entry-field">
        <span>Land type</span>
        <select name="category" defaultValue="" aria-label="Land type">
          <option value="">All land types</option>
          <option value="agricultural">Agricultural land</option>
          <option value="na">NA land</option>
          <option value="industrial">Industrial land</option>
        </select>
      </label>
      <label className="search-entry-field">
        <span>Transaction</span>
        <select name="transaction" defaultValue="" aria-label="Transaction">
          <option value="">Buy, rent or lease</option>
          <option value="buy">Buy</option>
          <option value="rent">Rent</option>
          <option value="lease">Lease</option>
        </select>
      </label>
      <label className="search-entry-field">
        <span>Budget</span>
        <select
          aria-label="Budget"
          value={budget}
          onChange={(event) => setBudget(event.target.value as keyof typeof budgetRanges)}
        >
          <option value="">Any budget</option>
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
        Search Land
      </button>
    </form>
  );
}
