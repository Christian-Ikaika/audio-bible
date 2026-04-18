import type { BibleReference } from "@/types/bible";
import { lookupBibleBook } from "./bible-books";

const KNOWN_TRANSLATIONS = [
  "NIV", "KJV", "ESV", "NKJV", "NLT", "NASB", "AMP", "MSG", "CSB",
  "RSV", "NRSV", "ASV", "YLT", "WEB", "CEV", "GNT", "NCV", "TLB",
  "NEB", "REB", "JB", "NAB", "NET", "ISV", "HCSB", "VOICE",
];

const TRANSLATION_REGEX = new RegExp(
  `\\b(${KNOWN_TRANSLATIONS.join("|")})\\b`,
  "i"
);

// Matches optional leading number (1, 2, 3, I, II, III) then book name then optional "chapter" then chapter number
// Examples:
//   Genesis 1
//   Genesis Chapter 1
//   1 Corinthians 13
//   2 Samuel Chapter 7
//   Psalms 23
//   John 3 NIV Audio Bible
const BIBLE_TITLE_REGEX =
  /^((?:[123]|I{1,3})\s)?([A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s+(?:chapter\s+)?(\d+)/i;

/**
 * Attempt to parse a Bible reference from a video title.
 * Returns undefined if parsing fails.
 */
export function parseBibleReferenceFromTitle(title: string): BibleReference | undefined {
  // Strip common suffixes that confuse matching
  const cleaned = title
    .replace(/\|.*$/, "")           // "Genesis 1 | KJV" → "Genesis 1"
    .replace(/[-–—].*$/, "")        // "Genesis 1 - Audio Bible" → "Genesis 1"
    .replace(/[()[\]]/g, " ")       // remove parens
    .replace(/\s+/g, " ")
    .trim();

  const match = BIBLE_TITLE_REGEX.exec(cleaned);
  if (!match) return undefined;

  const prefix = match[1]?.trim() ?? ""; // "1", "2", "3", "I", "II", etc.
  const bookRaw = match[2].trim();
  const chapter = parseInt(match[3], 10);

  if (isNaN(chapter) || chapter < 1) return undefined;

  // Reconstruct potential book name including numeric prefix
  const candidates = prefix
    ? [
        `${prefix} ${bookRaw}`,
        normalizeRomanPrefix(prefix) + " " + bookRaw,
      ]
    : [bookRaw];

  let found = null;
  for (const candidate of candidates) {
    found = lookupBibleBook(candidate);
    if (found) break;
  }

  if (!found) return undefined;

  // Try to extract translation
  const translationMatch = TRANSLATION_REGEX.exec(title);
  const translation = translationMatch ? translationMatch[1].toUpperCase() : undefined;

  return {
    book: found.name,
    bookAbbrev: found.abbrev,
    chapter,
    translation,
  };
}

/** Convert Roman numerals I/II/III to 1/2/3 */
function normalizeRomanPrefix(prefix: string): string {
  const map: Record<string, string> = {
    I: "1", II: "2", III: "3",
    i: "1", ii: "2", iii: "3",
  };
  return map[prefix.trim()] ?? prefix.trim();
}

/**
 * Normalize a raw book name input to canonical form.
 * Returns the canonical name or the input unchanged.
 */
export function normalizeBibleBookName(name: string): string {
  return lookupBibleBook(name)?.name ?? name;
}
