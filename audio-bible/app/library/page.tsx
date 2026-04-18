"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PlaylistCard from "@/components/PlaylistCard";
import { loadLibrary, deletePlaylist } from "@/lib/playlist-storage";
import { loadListened } from "@/lib/playback-storage";
import type { SavedPlaylist } from "@/types/app";

export default function LibraryPage() {
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([]);
  const [listenedMap, setListenedMap] = useState<Record<string, number>>({});

  useEffect(() => {
    setPlaylists(loadLibrary().playlists);
    const listened = loadListened();
    const map: Record<string, number> = {};
    for (const item of listened) {
      map[item.playlistId] = (map[item.playlistId] ?? 0) + 1;
    }
    setListenedMap(map);
  }, []);

  function handleDelete(id: string) {
    deletePlaylist(id);
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-surface-900">
      <header className="border-b border-surface-700 bg-surface-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-slate-200 transition-colors">
            <BackIcon />
          </Link>
          <h1 className="font-bold text-lg text-slate-100">Library</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {playlists.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm mb-4">Your library is empty</p>
            <Link href="/" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
              ← Import a playlist
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {playlists.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                onDelete={handleDelete}
                listenedCount={listenedMap[pl.id] ?? 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BackIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
