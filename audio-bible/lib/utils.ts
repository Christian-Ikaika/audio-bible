import type { ParsedTrack } from "@/types/bible";
import type { BookGroup } from "@/types/bible";

/** Format seconds → M:SS or H:MM:SS */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Group parsed tracks by Bible book */
export function groupTracksByBook(tracks: ParsedTrack[]): BookGroup[] {
  const map = new Map<string, BookGroup>();
  for (const track of tracks) {
    if (!track.bibleRef) continue;
    const key = track.bibleRef.book;
    if (!map.has(key)) {
      map.set(key, {
        book: track.bibleRef.book,
        bookAbbrev: track.bibleRef.bookAbbrev,
        tracks: [],
      });
    }
    map.get(key)!.tracks.push(track);
  }
  return Array.from(map.values());
}

/** Return the % of listened tracks in a playlist */
export function listenedPercent(
  total: number,
  listenedCount: number
): number {
  if (total === 0) return 0;
  return Math.round((listenedCount / total) * 100);
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
