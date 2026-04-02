function decodeHtmlEntities(value) {
  if (typeof value !== "string" || !value) return value;

  return value
    .replace(/&amp;#x2F;/gi, "/")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&#([0-9]+);/g, (_match, dec) =>
      String.fromCharCode(parseInt(dec, 10)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function parseGovernorateName(value) {
  const decoded = String(decodeHtmlEntities(value || "") || "").trim();
  if (!decoded) {
    return {
      raw: "",
      en: "",
      ar: "",
    };
  }

  const parts = decoded
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      raw: decoded,
      en: parts[0],
      ar: parts.slice(1).join(" / "),
    };
  }

  return {
    raw: decoded,
    en: decoded,
    ar: decoded,
  };
}

export function getGovernorateDisplayName(value, locale = "en") {
  const parsed = parseGovernorateName(value);
  return locale === "ar" ? parsed.ar || parsed.en : parsed.en || parsed.ar;
}

export function matchesGovernorateQuery(value, query = "") {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return true;

  const parsed = parseGovernorateName(value);
  return [parsed.raw, parsed.en, parsed.ar].some((part) =>
    String(part || "").toLowerCase().includes(normalizedQuery),
  );
}
