export interface YouTubePlaylistMetadata {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  itemCount: number;
  publishedAt: string;
}

export interface YouTubePlaylistItem {
  id: string; // playlistItem ID
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  position: number;
  publishedAt: string;
}

// Raw YouTube API response shapes (partial)
export interface YTPlaylistApiResponse {
  items: YTPlaylistApiItem[];
  nextPageToken?: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
}

export interface YTPlaylistApiItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default?: YTThumbnail;
      medium?: YTThumbnail;
      high?: YTThumbnail;
      standard?: YTThumbnail;
    };
    channelTitle: string;
    localized?: { title: string; description: string };
    publishedAt: string;
  };
  contentDetails?: { itemCount: number };
}

export interface YTPlaylistItemsApiResponse {
  items: YTPlaylistItemApiItem[];
  nextPageToken?: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
}

export interface YTPlaylistItemApiItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default?: YTThumbnail;
      medium?: YTThumbnail;
      high?: YTThumbnail;
    };
    channelTitle: string;
    resourceId: { videoId: string };
    position: number;
    publishedAt: string;
  };
}

export interface YTThumbnail {
  url: string;
  width: number;
  height: number;
}
