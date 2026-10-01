import { describe, expect, it } from "vitest";

import { defaultLocale, isLocale, localeForFormatting } from "@/lib/i18n/config";
import { dictionaries, translate } from "@/lib/i18n/dictionaries";
import { formatLocalCalendarDate, minimumLocalVisitDate } from "@/lib/formatting/local-date";

describe("public localization", () => {
  it("supports English, Gujarati and Hindi with an English fallback", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("gu")).toBe(true);
    expect(isLocale("hi")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(defaultLocale).toBe("en");
    expect(Object.keys(dictionaries.gu)).toEqual(Object.keys(dictionaries.en));
    expect(Object.keys(dictionaries.hi)).toEqual(Object.keys(dictionaries.en));
    expect(translate("gu", "nav.explore")).toBe("જમીન જુઓ");
    expect(localeForFormatting("hi")).toBe("hi-IN");
  });
});

describe("local calendar date formatting", () => {
  it("uses local calendar fields instead of UTC serialization", () => {
    const localDate = new Date(2026, 9, 1, 0, 5);
    expect(formatLocalCalendarDate(localDate)).toBe("2026-10-01");
    expect(minimumLocalVisitDate(localDate)).toBe("2026-10-02");
  });
});
