"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ParsedTrack } from "@/types/bible";
import type { YTPlayerInstance } from "./YouTubePlayer";
import YouTubePlayer, { type PlayerState } from "./YouTubePlayer";
import { formatTime } from "@/lib/utils";
import { savePlaybackState } from "@/lib/playback-storage";

const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];

interface Props {
  playlistId: string;
  tracks: ParsedTrack[];
  currentTrack: ParsedTrack | null;
  resumeTimestamp?: number;
  onTrackEnded?: () => void;
  onTrackChange?: (track: ParsedTrack) => void;
}

export default function PlayerShell({
  playlistId,
  tracks,
  currentTrack,
  resumeTimestamp = 0,
  onTrackEnded,
  onTrackChange,
}: Props) {
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>("unstarted");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRates, setShowRates] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [startSeconds, setStartSeconds] = useState(resumeTimestamp);

  // When track changes reset time display
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setStartSeconds(resumeTimestamp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.videoId]);

  // Poll time while playing
  useEffect(() => {
    if (playerState === "playing" && playerRef.current) {
      tickRef.current = setInterval(() => {
        if (!playerRef.current) return;
        const ct = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        setCurrentTime(ct);
        setDuration(dur);
        scheduleSave(ct);
      }, 1000);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerState]);

  const scheduleSave = useCallback((ct: number) => {
    if (!currentTrack) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      savePlaybackState({
        playlistId,
        videoId: currentTrack.videoId,
        position: currentTrack.position,
        timestamp: ct,
        updatedAt: new Date().toISOString(),
      });
    }, 2000);
  }, [currentTrack, playlistId]);

  function handleReady(player: YTPlayerInstance) {
    playerRef.current = player;
  }

  function handleStateChange(state: PlayerState) {
    setPlayerState(state);
    if (state === "ended") onTrackEnded?.();
  }

  function togglePlay() {
    if (!playerRef.current) return;
    if (playerState === "playing") {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    setCurrentTime(t);
    playerRef.current?.seekTo(t, true);
  }

  function handlePrev() {
    if (!currentTrack) return;
    const idx = tracks.findIndex((t) => t.videoId === currentTrack.videoId);
    if (idx > 0) onTrackChange?.(tracks[idx - 1]);
  }

  function handleNext() {
    if (!currentTrack) return;
    const idx = tracks.findIndex((t) => t.videoId === currentTrack.videoId);
    if (idx < tracks.length - 1) onTrackChange?.(tracks[idx + 1]);
  }

  function cycleRate() {
    if (!playerRef.current) return;
    const current = playbackRate;
    const next = RATES[(RATES.indexOf(current) + 1) % RATES.length];
    playerRef.current.setPlaybackRate(next);
    setPlaybackRate(next);
  }

  const isPlaying = playerState === "playing";
  const isBuffering = playerState === "buffering";
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trackIndex = currentTrack ? tracks.findIndex((t) => t.videoId === currentTrack.videoId) : -1;
  const hasPrev = trackIndex > 0;
  const hasNext = trackIndex >= 0 && trackIndex < tracks.length - 1;

  if (!currentTrack) return null;

  return (
    <>
      {/* Hidden YouTube player (must be in DOM) */}
      <YouTubePlayer
        videoId={currentTrack.videoId}
        startSeconds={startSeconds}
        onReady={handleReady}
        onStateChange={handleStateChange}
      />

      {/* Sticky player bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-800/95 backdrop-blur-md
                      border-t border-surface-600 safe-area-bottom">
        {/* Progress bar */}
        <div className="px-0">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="progress-bar w-full"
            aria-label="Seek"
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          {/* Track info */}
          <Link href={`/playlist/${playlistId}`} className="flex items-center gap-3 flex-1 min-w-0">
            {currentTrack.thumbnailUrl && (
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700">
                <Image
                  src={currentTrack.thumbnailUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate leading-tight">
                {currentTrack.bibleRef
                  ? `${currentTrack.bibleRef.book} ${currentTrack.bibleRef.chapter}`
                  : currentTrack.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatTime(currentTime)}
                {duration > 0 && ` / ${formatTime(duration)}`}
              </p>
            </div>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Speed */}
            <button
              onClick={cycleRate}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded-lg
                         hover:bg-surface-700 transition-colors font-medium tabular-nums"
              aria-label="Playback speed"
            >
              {playbackRate}×
            </button>

            {/* Prev */}
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-surface-700
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous track"
            >
              <PrevIcon />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-500
                         flex items-center justify-center text-white
                         transition-all duration-150 active:scale-95 shadow-lg"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isBuffering ? (
                <BufferingIcon />
              ) : isPlaying ? (
                <PauseIcon />
              ) : (
                <PlayIcon />
              )}
            </button>

            {/* Next */}
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-surface-700
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next track"
            >
              <NextIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom spacer so content doesn't hide under player */}
      <div className="h-24" />
    </>
  );
}

function PlayIcon() {
  return (
    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 3.9V8.1L8.5 12zM16 6h2v12h-2z" />
    </svg>
  );
}
function BufferingIcon() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
