// Study pages localise everything via the language toggle, but the date badge
// was hardcoded to "en-NZ", so a 中文 visitor saw an English-formatted date next
// to a localized status pill. Format the date in the active UI language instead.
export function formatStudyDate(value: Date | string, lang: "en" | "zh"): string {
  return new Date(value).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
