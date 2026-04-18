"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PlaylistImportForm from "@/components/PlaylistImportForm";
import ContinueListeningCard from "@/components/ContinueListeningCard";
import PlaylistCard from "@/components/PlaylistCard";
import { loadLibrary, deletePlaylist } from "@/lib/playlist-storage";
import { loadPlaybackState, loadListened } from "@/lib/playback-storage";
import type { SavedPlaylist } from "@/types/app";
import type { PlaybackState } from "@/types/app";

export default function HomePage() {
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([]);
  const [resumeState, setResumeState] = useState<PlaybackState | null>(null);
  const [listenedMap, setListenedMap] = useState<Record<string, number>>({});
  const [imported, setImported] = useState(false);

  useEffect(() => {
    const lib = loadLibrary();
    setPlaylists(lib.playlists);

    const state = loadPlaybackState();
    if (state) setResumeState(state);

    // Build a map of playlistId → listened count
    const listened = loadListened();
    const map: Record<string, number> = {};
    for (const item of listened) {
      map[item.playlistId] = (map[item.playlistId] ?? 0) + 1;
    }
    setListenedMap(map);
  }, [imported]);

  function handleImported(playlist: SavedPlaylist) {
    setPlaylists((prev) => {
      const filtered = prev.filter((p) => p.id !== playlist.id);
      return [playlist, ...filtered];
    });
    setImported((v) => !v); // trigger re-read
  }

  function handleDelete(id: string) {
    deletePlaylist(id);
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }

  const resumePlaylist = resumeState
    ? playlists.find((p) => p.id === resumeState.playlistId)
    : undefined;

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Header */}
      <header className="border-b border-surface-700 bg-surface-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpenIcon />
            <span className="font-bold text-lg text-slate-100 tracking-tight">Audio Bible</span>
          </div>
          {playlists.length > 0 && (
            <Link
              href="/library"
              className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Library ({playlists.length})
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <section>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">
            Your personal Bible listener
          </h1>
          <p className="text-slate-400 text-sm">
            Paste a YouTube playlist to start listening. Your progress is saved locally.
          </p>
        </section>

        {/* Import */}
        <section className="bg-surface-800 rounded-2xl p-5 border border-surface-600">
          <PlaylistImportForm onImported={handleImported} />
        </section>

        {/* Continue listening */}
        {resumeState && resumePlaylist && (
          <section>
            <ContinueListeningCard state={resumeState} playlist={resumePlaylist} />
          </section>
        )}

        {/* Recent playlists */}
        {playlists.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-200">Your library</h2>
              {playlists.length > 3 && (
                <Link href="/library" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                  See all
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {playlists.slice(0, 4).map((pl) => (
                <PlaylistCard
                  key={pl.id}
                  playlist={pl}
                  onDelete={handleDelete}
                  listenedCount={listenedMap[pl.id] ?? 0}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {playlists.length === 0 && (
          <section className="text-center py-12">
            <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon large />
            </div>
            <p className="text-slate-400 text-sm mb-1">No playlists yet</p>
            <p className="text-slate-600 text-xs">
              Paste a YouTube playlist URL above to get started
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

function BookOpenIcon({ large = false }: { large?: boolean }) {
  return (
    <svg
      className={large ? "w-8 h-8 text-brand-500" : "w-6 h-6 text-brand-500"}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
