"use client";

import { useState } from "react";
import type { BookGroup } from "@/types/bible";
import type { ParsedTrack } from "@/types/bible";

interface Props {
  groups: BookGroup[];
  currentVideoId: string | null;
  listenedIds: Set<string>;
  onPlay: (track: ParsedTrack) => void;
}

export default function BookChapterNav({
  groups,
  currentVideoId,
  listenedIds,
  onPlay,
}: Props) {
  const [openBook, setOpenBook] = useState<string | null>(() => {
    // Auto-open the book that has the currently playing track
    return null;
  });

  if (groups.length === 0) return null;

  return (
    <div className="space-y-1">
      {groups.map((group) => {
        const isOpen = openBook === group.book;
        const hasActive = group.tracks.some((t) => t.videoId === currentVideoId);
        const listenedInGroup = group.tracks.filter((t) => listenedIds.has(t.videoId)).length;
        const pct = Math.round((listenedInGroup / group.tracks.length) * 100);

        return (
          <div key={group.book} className="rounded-xl overflow-hidden border border-surface-600">
            {/* Book header */}
            <button
              onClick={() => setOpenBook(isOpen ? null : group.book)}
              className={`w-full flex items-center justify-between px-4 py-3
                          transition-colors text-left
                          ${hasActive ? "bg-brand-900/30" : "bg-surface-800 hover:bg-surface-700"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-400">{group.bookAbbrev}</span>
                </div>
                <div>
                  <span className={`text-sm font-semibold ${hasActive ? "text-brand-400" : "text-slate-200"}`}>
                    {group.book}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    {group.tracks.length} ch.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Mini progress */}
                {pct > 0 && (
                  <div className="w-12 h-1 bg-surface-600 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                )}
                <ChevronIcon open={isOpen} />
              </div>
            </button>

            {/* Chapter list */}
            {isOpen && (
              <div className="bg-surface-900 grid grid-cols-4 sm:grid-cols-6 gap-1 p-2">
                {group.tracks.map((track) => {
                  const isActive = track.videoId === currentVideoId;
                  const done = listenedIds.has(track.videoId);
                  return (
                    <button
                      key={track.videoId}
                      onClick={() => onPlay(track)}
                      className={`rounded-lg py-2 px-1 text-xs font-medium transition-all
                                  ${isActive
                                    ? "bg-brand-600 text-white"
                                    : done
                                      ? "bg-surface-700 text-brand-400 border border-brand-900"
                                      : "bg-surface-800 text-slate-400 hover:bg-surface-600 hover:text-slate-200"
                                  }`}
                      aria-label={`Play ${track.title}`}
                    >
                      {track.bibleRef?.chapter ?? track.position + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
