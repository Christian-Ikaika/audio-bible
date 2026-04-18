import type { Bookmark, ListenedItem, PlaybackState, RecentlyPlayed } from "@/types/app";

const PLAYBACK_KEY = "audiobible:playback";
const LISTENED_KEY = "audiobible:listened";
const RECENT_KEY = "audiobible:recent";
const BOOKMARKS_KEY = "audiobible:bookmarks";

// ─── Playback state ────────────────────────────────────────────────────────────

export function savePlaybackState(state: PlaybackState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAYBACK_KEY, JSON.stringify(state));
}

export function loadPlaybackState(): PlaybackState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PLAYBACK_KEY);
    return raw ? (JSON.parse(raw) as PlaybackState) : null;
  } catch {
    return null;
  }
}

export function clearPlaybackState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PLAYBACK_KEY);
}

// ─── Listened items ───────────────────────────────────────────────────────────

export function loadListened(): ListenedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LISTENED_KEY);
    return raw ? (JSON.parse(raw) as ListenedItem[]) : [];
  } catch {
    return [];
  }
}

export function markListened(item: Omit<ListenedItem, "completedAt">): void {
  const all = loadListened();
  const exists = all.find(
    (i) => i.videoId === item.videoId && i.playlistId === item.playlistId
  );
  if (!exists) {
    all.push({ ...item, completedAt: new Date().toISOString() });
    localStorage.setItem(LISTENED_KEY, JSON.stringify(all));
  }
}

export function unmarkListened(videoId: string, playlistId: string): void {
  const all = loadListened().filter(
    (i) => !(i.videoId === videoId && i.playlistId === playlistId)
  );
  localStorage.setItem(LISTENED_KEY, JSON.stringify(all));
}

export function isListened(videoId: string, playlistId: string): boolean {
  return loadListened().some(
    (i) => i.videoId === videoId && i.playlistId === playlistId
  );
}

// ─── Recently played ──────────────────────────────────────────────────────────

const MAX_RECENT = 10;

export function addRecentlyPlayed(item: Omit<RecentlyPlayed, "playedAt">): void {
  if (typeof window === "undefined") return;
  const all = loadRecentlyPlayed().filter((r) => r.videoId !== item.videoId);
  all.unshift({ ...item, playedAt: new Date().toISOString() });
  localStorage.setItem(RECENT_KEY, JSON.stringify(all.slice(0, MAX_RECENT)));
}

export function loadRecentlyPlayed(): RecentlyPlayed[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as RecentlyPlayed[]) : [];
  } catch {
    return [];
  }
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export function loadBookmarks(playlistId?: string): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    const all: Bookmark[] = raw ? JSON.parse(raw) : [];
    return playlistId ? all.filter((b) => b.playlistId === playlistId) : all;
  } catch {
    return [];
  }
}

export function saveBookmark(bookmark: Omit<Bookmark, "id" | "createdAt">): Bookmark {
  const all = loadBookmarks();
  const newBookmark: Bookmark = {
    ...bookmark,
    id: `bm_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  all.push(newBookmark);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(all));
  return newBookmark;
}

export function deleteBookmark(id: string): void {
  const all = loadBookmarks().filter((b) => b.id !== id);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(all));
}
