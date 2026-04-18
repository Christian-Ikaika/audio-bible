"use client";

import { useMemo, useRef, useEffect } from "react";
import type { ParsedTrack } from "@/types/bible";
import TrackRow from "./TrackRow";

interface Props {
  tracks: ParsedTrack[];
  currentVideoId: string | null;
  listenedIds: Set<string>;
  onPlay: (track: ParsedTrack) => void;
  onToggleListened: (track: ParsedTrack) => void;
  searchQuery: string;
}

export default function TrackList({
  tracks,
  currentVideoId,
  listenedIds,
  onPlay,
  onToggleListened,
  searchQuery,
}: Props) {
  const activeRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tracks;
    const q = searchQuery.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.bibleRef?.book.toLowerCase().includes(q) ||
        String(t.bibleRef?.chapter).includes(q)
    );
  }, [tracks, searchQuery]);

  // Scroll active track into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentVideoId]);

  if (filtered.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="text-sm">No tracks match &ldquo;{searchQuery}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {filtered.map((track) => (
        <div
          key={track.videoId}
          ref={track.videoId === currentVideoId ? activeRef : undefined}
        >
          <TrackRow
            track={track}
            index={track.position}
            isActive={track.videoId === currentVideoId}
            isListened={listenedIds.has(track.videoId)}
            onPlay={onPlay}
            onToggleListened={onToggleListened}
          />
        </div>
      ))}
    </div>
  );
}
