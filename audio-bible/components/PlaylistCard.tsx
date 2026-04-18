"use client";

import Image from "next/image";
import Link from "next/link";
import type { SavedPlaylist } from "@/types/app";

interface Props {
  playlist: SavedPlaylist;
  onDelete: (id: string) => void;
  listenedCount?: number;
}

export default function PlaylistCard({ playlist, onDelete, listenedCount = 0 }: Props) {
  const { metadata } = playlist;
  const total = playlist.items.length;
  const pct = total > 0 ? Math.round((listenedCount / total) * 100) : 0;
  const parsedCount = playlist.parsedTracks.filter((t) => t.bibleRef).length;
  const hasBibleData = parsedCount > 0;

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Remove "${metadata.title}" from your library?`)) {
      onDelete(playlist.id);
    }
  }

  return (
    <Link href={`/playlist/${playlist.id}`} className="group block">
      <div className="bg-surface-800 hover:bg-surface-700 border border-surface-600 hover:border-surface-500
                      rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video overflow-hidden">
          {metadata.thumbnailUrl ? (
            <Image
              src={metadata.thumbnailUrl}
              alt={metadata.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-surface-700 flex items-center justify-center">
              <BookIcon />
            </div>
          )}
          {/* Overlay badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 rounded-lg px-2 py-0.5 text-xs text-slate-300">
            {total} tracks
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 group-hover:text-brand-400 transition-colors">
                {metadata.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{metadata.channelTitle}</p>
            </div>
            <button
              onClick={handleDelete}
              className="flex-shrink-0 text-slate-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
              aria-label="Remove playlist"
            >
              <TrashIcon />
            </button>
          </div>

          {/* Progress bar */}
          {listenedCount > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{listenedCount} of {total} listened</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1 bg-surface-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {hasBibleData && (
              <span className="text-xs bg-brand-900/40 text-brand-400 border border-brand-900 rounded-full px-2 py-0.5">
                Bible parsed
              </span>
            )}
            <span className="text-xs bg-surface-700 text-slate-500 rounded-full px-2 py-0.5">
              {new Date(playlist.importedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function BookIcon() {
  return (
    <svg className="w-12 h-12 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
