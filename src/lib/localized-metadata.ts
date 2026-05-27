import type { Metadata } from "next";
import { getServerLang } from "@/lib/lang";

export async function localizedMetadata({
  en,
  zh,
}: {
  en: Metadata;
  zh: Metadata;
}): Promise<Metadata> {
  return (await getServerLang()) === "ZH" ? zh : en;
}
