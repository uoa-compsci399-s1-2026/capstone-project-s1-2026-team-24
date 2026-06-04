import { describe, expect, it } from "vitest";

import { formatStudyDate } from "@/lib/format-study-date";

// Regression for B31 / bug-hunt M1: the study date badge was hardcoded to
// "en-NZ", ignoring the language toggle, so a 中文 visitor saw an English date
// next to a localized status pill. It must follow the active language.
describe("formatStudyDate", () => {
  const date = new Date(2026, 5, 4); // 4 June 2026, local time (tz-stable)

  it("formats English dates as en-NZ (day month year)", () => {
    expect(formatStudyDate(date, "en")).toBe("4 June 2026");
  });

  it("formats Chinese dates as zh-CN (年/月/日)", () => {
    expect(formatStudyDate(date, "zh")).toBe("2026年6月4日");
  });

  it("respects the locale (en and zh differ)", () => {
    expect(formatStudyDate(date, "en")).not.toBe(formatStudyDate(date, "zh"));
  });

  it("accepts an ISO date string", () => {
    expect(formatStudyDate("2026-06-04T12:00:00", "en")).toContain("2026");
  });
});
