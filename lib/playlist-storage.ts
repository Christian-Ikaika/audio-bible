import type { AppLibrary, SavedPlaylist } from "@/types/app";
import type { YouTubePlaylistItem, YouTubePlaylistMetadata } from "@/types/youtube";
import { parseBibleReferenceFromTitle } from "./bible-parser";
import type { ParsedTrack } from "@/types/bible";

const LIBRARY_KEY = "audiobible:library";
const LIBRARY_VERSION = 1;

function emptyLibrary(): AppLibrary {
  return { playlists: [], version: LIBRARY_VERSION };
}

export function loadLibrary(): AppLibrary {
  if (typeof window === "undefined") return emptyLibrary();
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return emptyLibrary();
    return JSON.parse(raw) as AppLibrary;
  } catch {
    return emptyLibrary();
  }
}

export function saveLibrary(library: AppLibrary): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
}

export function getPlaylist(id: string): SavedPlaylist | undefined {
  return loadLibrary().playlists.find((p) => p.id === id);
}

export function savePlaylist(
  metadata: YouTubePlaylistMetadata,
  items: YouTubePlaylistItem[]
): SavedPlaylist {
  const library = loadLibrary();

  const parsedTracks: ParsedTrack[] = items.map((item) => ({
    videoId: item.videoId,
    title: item.title,
    position: item.position,
    thumbnailUrl: item.thumbnailUrl,
    publishedAt: item.publishedAt,
    bibleRef: parseBibleReferenceFromTitle(item.title),
  }));

  const saved: SavedPlaylist = {
    id: metadata.id,
    metadata,
    items,
    parsedTracks,
    importedAt: new Date().toISOString(),
  };

  const existing = library.playlists.findIndex((p) => p.id === metadata.id);
  if (existing >= 0) {
    library.playlists[existing] = saved;
  } else {
    library.playlists.unshift(saved);
  }

  saveLibrary(library);
  return saved;
}

export function deletePlaylist(id: string): void {
  const library = loadLibrary();
  library.playlists = library.playlists.filter((p) => p.id !== id);
  saveLibrary(library);
}

export function touchPlaylist(id: string): void {
  const library = loadLibrary();
  const pl = library.playlists.find((p) => p.id === id);
  if (pl) {
    pl.lastOpenedAt = new Date().toISOString();
    saveLibrary(library);
  }
}
