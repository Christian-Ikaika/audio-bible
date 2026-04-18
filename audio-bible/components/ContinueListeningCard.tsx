"use client";

import Link from "next/link";
import Image from "next/image";
import type { PlaybackState } from "@/types/app";
import type { SavedPlaylist } from "@/types/app";

interface Props {
  state: PlaybackState;
  playlist: SavedPlaylist | undefined;
}

export default function ContinueListeningCard({ state, playlist }: Props) {
  if (!playlist) return null;

  const track = playlist.parsedTracks.find((t) => t.videoId === state.videoId);
  if (!track) return null;

  const label = track.bibleRef
    ? `${track.bibleRef.book} ${track.bibleRef.chapter}`
    : track.title;

  return (
    <Link
      href={`/playlist/${state.playlistId}?resume=1`}
      className="flex items-center gap-4 bg-brand-900/30 border border-brand-800/50
                 hover:bg-brand-900/50 rounded-2xl p-4 transition-all duration-200 group"
    >
      {track.thumbnailUrl && (
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-700">
          <Image
            src={track.thumbnailUrl}
            alt=""
            width={56}
            height={56}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-brand-400 font-medium uppercase tracking-wider mb-0.5">
          Continue listening
        </p>
        <p className="text-sm font-semibold text-slate-100 truncate">{label}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{playlist.metadata.title}</p>
      </div>
      <div className="text-brand-400 flex-shrink-0">
        <PlayCircleIcon />
      </div>
    </Link>
  );
}

function PlayCircleIcon() {
  return (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
    </svg>
  );
}
