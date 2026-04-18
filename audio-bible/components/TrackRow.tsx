"use client";

import type { ParsedTrack } from "@/types/bible";

interface Props {
  track: ParsedTrack;
  index: number;
  isActive: boolean;
  isListened: boolean;
  onPlay: (track: ParsedTrack) => void;
  onToggleListened: (track: ParsedTrack) => void;
}

export default function TrackRow({
  track,
  index,
  isActive,
  isListened,
  onPlay,
  onToggleListened,
}: Props) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer group
                  transition-all duration-150 rounded-xl
                  ${isActive
                    ? "track-active"
                    : "hover:bg-surface-700"
                  }`}
      onClick={() => onPlay(track)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onPlay(track)}
      aria-label={`Play ${track.title}`}
      aria-current={isActive ? "true" : undefined}
    >
      {/* Index / playing indicator */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center">
        {isActive ? (
          <PlayingBars />
        ) : (
          <span className="text-xs text-slate-600 group-hover:hidden">{index + 1}</span>
        )}
        {!isActive && (
          <span className="hidden group-hover:block text-brand-400">
            <PlayIcon />
          </span>
        )}
      </div>

      {/* Title & Bible ref */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug truncate
                       ${isActive ? "text-brand-400" : "text-slate-200"}`}>
          {track.title}
        </p>
        {track.bibleRef && (
          <p className="text-xs text-slate-500 mt-0.5">
            {track.bibleRef.book} {track.bibleRef.chapter}
            {track.bibleRef.translation ? ` · ${track.bibleRef.translation}` : ""}
          </p>
        )}
      </div>

      {/* Listened toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleListened(track);
        }}
        className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-150
                    ${isListened
                      ? "text-brand-400 bg-brand-500/10"
                      : "text-slate-600 hover:text-slate-400"
                    }`}
        aria-label={isListened ? "Mark as unlistened" : "Mark as listened"}
        title={isListened ? "Listened" : "Mark listened"}
      >
        <CheckIcon />
      </button>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PlayingBars() {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-0.5 bg-brand-400 rounded-full animate-pulse"
          style={{
            height: `${[60, 100, 80][i]}%`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.8s",
          }}
        />
      ))}
    </div>
  );
}
