import type {
  YouTubePlaylistItem,
  YouTubePlaylistMetadata,
  YTPlaylistApiItem,
  YTPlaylistApiResponse,
  YTPlaylistItemsApiResponse,
} from "@/types/youtube";

const API_BASE = "https://www.googleapis.com/youtube/v3";

function apiKey(): string {
  const key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!key) throw new Error("YouTube API key is not configured. Set NEXT_PUBLIC_YOUTUBE_API_KEY in .env.local");
  return key;
}

/** Parse a YouTube playlist ID from various URL formats */
export function parseYouTubePlaylistId(input: string): string | null {
  const trimmed = input.trim();

  // Already a bare playlist ID (no slashes, ~34 chars starting with PL/FL/RD/OL/LL)
  if (/^(PL|FL|RD|OL|LL|UU)[A-Za-z0-9_-]{10,}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const listParam = url.searchParams.get("list");
    if (listParam) return listParam;
  } catch {
    // Not a URL — fall through
  }

  // Last-ditch regex
  const match = /[?&]list=([A-Za-z0-9_-]+)/.exec(trimmed);
  return match ? match[1] : null;
}

/** Fetch playlist metadata (title, description, thumbnail, itemCount) */
export async function fetchPlaylistMetadata(
  playlistId: string
): Promise<YouTubePlaylistMetadata> {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    id: playlistId,
    key: apiKey(),
  });

  const res = await fetch(`${API_BASE}/playlists?${params}`);
  if (!res.ok) await throwYouTubeError(res);

  const data: YTPlaylistApiResponse = await res.json();

  if (!data.items || data.items.length === 0) {
    throw new Error(
      "Playlist not found. Make sure the playlist is public and the ID is correct."
    );
  }

  return mapPlaylistMetadata(data.items[0]);
}

/** Fetch all items in a playlist, handling pagination */
export async function fetchPlaylistItems(
  playlistId: string,
  maxItems = 500
): Promise<YouTubePlaylistItem[]> {
  const items: YouTubePlaylistItem[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const params = new URLSearchParams({
      part: "snippet",
      playlistId,
      maxResults: "50",
      key: apiKey(),
      ...(pageToken ? { pageToken } : {}),
    });

    const res = await fetch(`${API_BASE}/playlistItems?${params}`);
    if (!res.ok) await throwYouTubeError(res);

    const data: YTPlaylistItemsApiResponse = await res.json();

    for (const item of data.items) {
      // Skip private/deleted videos (videoId will be empty or "Private video")
      if (!item.snippet.resourceId.videoId) continue;

      items.push({
        id: item.id,
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          "",
        channelTitle: item.snippet.channelTitle,
        position: item.snippet.position,
        publishedAt: item.snippet.publishedAt,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken && items.length < maxItems);

  return items;
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

function mapPlaylistMetadata(item: YTPlaylistApiItem): YouTubePlaylistMetadata {
  const snippet = item.snippet;
  return {
    id: item.id,
    title: snippet.localized?.title ?? snippet.title,
    description: snippet.localized?.description ?? snippet.description,
    thumbnailUrl:
      snippet.thumbnails.high?.url ??
      snippet.thumbnails.medium?.url ??
      snippet.thumbnails.default?.url ??
      "",
    channelTitle: snippet.channelTitle,
    itemCount: item.contentDetails?.itemCount ?? 0,
    publishedAt: snippet.publishedAt,
  };
}

async function throwYouTubeError(res: Response): Promise<never> {
  let message = `YouTube API error: ${res.status}`;
  try {
    const body = await res.json();
    const apiMsg = body?.error?.message;
    if (apiMsg) message = `YouTube API: ${apiMsg}`;
  } catch {
    // ignore parse failure
  }
  throw new Error(message);
}
