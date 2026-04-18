export interface BibleReference {
  book: string; // normalized book name, e.g. "Genesis"
  bookAbbrev: string; // e.g. "Gen"
  chapter: number;
  translation?: string; // e.g. "NIV", "KJV"
}

export interface ParsedTrack {
  videoId: string;
  title: string;
  position: number;
  bibleRef?: BibleReference;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface BookGroup {
  book: string;
  bookAbbrev: string;
  tracks: ParsedTrack[];
}
