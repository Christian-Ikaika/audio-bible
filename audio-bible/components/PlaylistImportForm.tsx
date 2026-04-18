"use client";

import { useState } from "react";
import { parseYouTubePlaylistId, fetchPlaylistMetadata, fetchPlaylistItems } from "@/lib/youtube";
import { savePlaylist } from "@/lib/playlist-storage";
import type { SavedPlaylist } from "@/types/app";

interface Props {
  onImported: (playlist: SavedPlaylist) => void;
}

type Status = "idle" | "loading" | "error";

export default function PlaylistImportForm({ onImported }: Props) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");

  async function handleImport() {
    const trimmed = url.trim();
    if (!trimmed) return;

    const playlistId = parseYouTubePlaylistId(trimmed);
    if (!playlistId) {
      setError("Couldn't find a playlist ID in that URL. Make sure it contains ?list=… or is a valid playlist link.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      setLoadingMsg("Fetching playlist info…");
      const metadata = await fetchPlaylistMetadata(playlistId);

      setLoadingMsg(`Loading ${metadata.itemCount} tracks…`);
      const items = await fetchPlaylistItems(playlistId);

      if (items.length === 0) {
        throw new Error("This playlist appears to be empty or all videos are private.");
      }

      const saved = savePlaylist(metadata, items);
      setUrl("");
      setStatus("idle");
      onImported(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Please try again.");
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-400 mb-2">
        YouTube Playlist URL
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          onKeyDown={(e) => e.key === "Enter" && !isLoading && handleImport()}
          placeholder="https://www.youtube.com/playlist?list=PL…"
          disabled={isLoading}
          className="flex-1 bg-surface-700 border border-surface-500 rounded-xl px-4 py-3
                     text-slate-100 placeholder-slate-600 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                     disabled:opacity-50 transition-colors"
          aria-label="Playlist URL"
        />
        <button
          onClick={handleImport}
          disabled={isLoading || !url.trim()}
          className="sm:w-auto w-full px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500
                     text-white font-semibold text-sm
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-150 active:scale-95 whitespace-nowrap"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 justify-center">
              <Spinner />
              {loadingMsg}
            </span>
          ) : (
            "Import Playlist"
          )}
        </button>
      </div>

      {status === "error" && error && (
        <p className="mt-3 text-sm text-red-400 flex items-start gap-2">
          <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
          {error}
        </p>
      )}

      <p className="mt-2 text-xs text-slate-600">
        Paste any YouTube playlist link — youtube.com/playlist?list=… or a video URL with a list parameter
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
