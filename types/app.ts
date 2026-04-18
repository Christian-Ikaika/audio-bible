import type { YouTubePlaylistItem, YouTubePlaylistMetadata } from "./youtube";
import type { ParsedTrack } from "./bible";

export interface SavedPlaylist {
  id: string; // YouTube playlist ID
  metadata: YouTubePlaylistMetadata;
  items: YouTubePlaylistItem[];
  parsedTracks: ParsedTrack[];
  importedAt: string;
  lastOpenedAt?: string;
}

export interface PlaybackState {
  playlistId: string;
  videoId: string;
  position: number; // item index in playlist
  timestamp: number; // seconds into video
  updatedAt: string;
}

export interface ListenedItem {
  videoId: string;
  playlistId: string;
  completedAt: string;
}

export interface Bookmark {
  id: string;
  videoId: string;
  playlistId: string;
  timestamp: number; // seconds
  note: string;
  createdAt: string;
}

export interface AppLibrary {
  playlists: SavedPlaylist[];
  version: number;
}

export interface RecentlyPlayed {
  videoId: string;
  playlistId: string;
  playlistTitle: string;
  trackTitle: string;
  thumbnailUrl: string;
  playedAt: string;
}
