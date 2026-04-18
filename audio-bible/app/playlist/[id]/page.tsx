"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import PlayerShell from "@/components/PlayerShell";
import TrackList from "@/components/TrackList";
import BookChapterNav from "@/components/BookChapterNav";
import SearchBar from "@/components/SearchBar";
import { getPlaylist, touchPlaylist } from "@/lib/playlist-storage";
import {
  loadListened,
  markListened,
  unmarkListened,
  loadPlaybackState,
  addRecentlyPlayed,
} from "@/lib/playback-storage";
import { groupTracksByBook } from "@/lib/utils";
import type { SavedPlaylist } from "@/types/app";
import type { ParsedTrack } from "@/types/bible";

type ViewMode = "list" | "books";

function PlaylistPageInner() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const shouldResume = searchParams.get("resume") === "1";

  const [playlist, setPlaylist] = useState<SavedPlaylist | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<ParsedTrack | null>(null);
  const [resumeTimestamp, setResumeTimestamp] = useState(0);
  const [listenedIds, setListenedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    const pl = getPlaylist(id);
    if (!pl) { setNotFound(true); return; }
    setPlaylist(pl);
    touchPlaylist(id);

    const listened = loadListened();
    setListenedIds(new Set(listened.filter((l) => l.playlistId === id).map((l) => l.videoId)));

    const saved = loadPlaybackState();
    if (shouldResume && saved && saved.playlistId === id) {
      const track = pl.parsedTracks.find((t) => t.videoId === saved.videoId);
      if (track) { setCurrentTrack(track); setResumeTimestamp(saved.timestamp); return; }
    }
    if (pl.parsedTracks.length > 0) setCurrentTrack(pl.parsedTracks[0]);
  }, [id, shouldResume]);

  const hasBibleData = useMemo(() => playlist?.parsedTracks.some((t) => t.bibleRef) ?? false, [playlist]);
  const bookGroups = useMemo(() => playlist ? groupTracksByBook(playlist.parsedTracks) : [], [playlist]);

  const handlePlay = useCallback((track: ParsedTrack) => {
    setCurrentTrack(track);
    setResumeTimestamp(0);
    if (playlist) {
      addRecentlyPlayed({
        videoId: track.videoId, playlistId: playlist.id,
        playlistTitle: playlist.metadata.title,
        trackTitle: track.title, thumbnailUrl: track.thumbnailUrl,
      });
    }
  }, [playlist]);

  const handleToggleListened = useCallback((track: ParsedTrack) => {
    const already = listenedIds.has(track.videoId);
    if (already) {
      unmarkListened(track.videoId, id);
      setListenedIds((prev) => { const n = new Set(prev); n.delete(track.videoId); return n; });
    } else {
      markListened({ videoId: track.videoId, playlistId: id });
      setListenedIds((prev) => new Set(prev).add(track.videoId));
    }
  }, [id, listenedIds]);

  const handleTrackEnded = useCallback(() => {
    if (!playlist || !currentTrack) return;
    markListened({ videoId: currentTrack.videoId, playlistId: id });
    setListenedIds((prev) => new Set(prev).add(currentTrack.videoId));
    const idx = playlist.parsedTracks.findIndex((t) => t.videoId === currentTrack.videoId);
    if (idx < playlist.parsedTracks.length - 1) handlePlay(playlist.parsedTracks[idx + 1]);
  }, [playlist, currentTrack, id, handlePlay]);

  if (notFound) return (
    <div className="min-h-screen bg-surface-900 flex flex-col items-center justify-center px-4">
      <p className="text-slate-400 text-sm mb-4">Playlist not found in your library.</p>
      <Link href="/" className="text-brand-400 hover:text-brand-300 text-sm font-medium">← Go home</Link>
    </div>
  );

  if (!playlist) return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const listenedCount = listenedIds.size;
  const total = playlist.parsedTracks.length;
  const pct = total > 0 ? Math.round((listenedCount / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-surface-900">
      <header className="border-b border-surface-700 bg-surface-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm text-slate-100 truncate">{playlist.metadata.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{total} tracks · {pct}% listened</p>
          </div>
        </div>
      </header>

      {listenedCount > 0 && (
        <div className="h-0.5 bg-surface-700">
          <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {currentTrack && (
          <div className="bg-surface-800 rounded-xl px-4 py-3 border border-surface-600">
            <p className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider font-medium">Now playing</p>
            <p className="text-sm font-semibold text-slate-100 truncate">
              {currentTrack.bibleRef ? `${currentTrack.bibleRef.book} ${currentTrack.bibleRef.chapter}` : currentTrack.title}
            </p>
            {currentTrack.bibleRef?.translation && (
              <p className="text-xs text-slate-500 mt-0.5">{currentTrack.bibleRef.translation}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search tracks…" className="flex-1" />
          {hasBibleData && (
            <div className="flex bg-surface-800 border border-surface-600 rounded-xl p-1 gap-1 flex-shrink-0">
              {(["list", "books"] as ViewMode[]).map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                    ${viewMode === mode ? "bg-surface-600 text-slate-100" : "text-slate-500 hover:text-slate-300"}`}>
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>

        {viewMode === "list" || !hasBibleData ? (
          <TrackList tracks={playlist.parsedTracks} currentVideoId={currentTrack?.videoId ?? null}
            listenedIds={listenedIds} onPlay={handlePlay} onToggleListened={handleToggleListened}
            searchQuery={searchQuery} />
        ) : (
          <BookChapterNav groups={bookGroups} currentVideoId={currentTrack?.videoId ?? null}
            listenedIds={listenedIds} onPlay={handlePlay} />
        )}
      </main>

      {currentTrack && (
        <PlayerShell playlistId={id} tracks={playlist.parsedTracks} currentTrack={currentTrack}
          resumeTimestamp={resumeTimestamp} onTrackEnded={handleTrackEnded} onTrackChange={handlePlay} />
      )}
    </div>
  );
}

export default function PlaylistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PlaylistPageInner />
    </Suspense>
  );
}
