export function getSafeHttpUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // Invalid URL.
  }

  return null;
}

/**
 * Resolves a publication's outbound link: its validated http(s) url, else the
 * DOI as an https://doi.org/ link, else null. getSafeHttpUrl rejects empty /
 * non-http(s) values, so an empty-string url falls through to the DOI. Shared by
 * the homepage cards and the research index so the fallback rule lives in one
 * place.
 */
export function publicationHref(pub: {
  url: string | null;
  doi: string | null;
}): string | null {
  return (
    getSafeHttpUrl(pub.url) ??
    (pub.doi ? getSafeHttpUrl(`https://doi.org/${pub.doi}`) : null)
  );
}
