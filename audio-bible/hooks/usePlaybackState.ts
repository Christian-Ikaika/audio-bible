"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaybackState } from "@/types/app";
import {
  loadPlaybackState,
  savePlaybackState,
} from "@/lib/playback-storage";

interface UsePlaybackStateOptions {
  playlistId: string;
  onRestored?: (state: PlaybackState) => void;
}

export function usePlaybackState({ playlistId, onRestored }: UsePlaybackStateOptions) {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [resumeTimestamp, setResumeTimestamp] = useState<number>(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore state on mount
  useEffect(() => {
    const saved = loadPlaybackState();
    if (saved && saved.playlistId === playlistId) {
      setCurrentVideoId(saved.videoId);
      setCurrentPosition(saved.position);
      setResumeTimestamp(saved.timestamp);
      onRestored?.(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

  const persistState = useCallback(
    (videoId: string, position: number, timestamp: number) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      // Debounce saves so we don't hammer localStorage every second
      saveTimerRef.current = setTimeout(() => {
        savePlaybackState({
          playlistId,
          videoId,
          position,
          timestamp,
          updatedAt: new Date().toISOString(),
        });
      }, 2000);
    },
    [playlistId]
  );

  const play = useCallback(
    (videoId: string, position: number, timestamp = 0) => {
      setCurrentVideoId(videoId);
      setCurrentPosition(position);
      setResumeTimestamp(timestamp);
      persistState(videoId, position, timestamp);
    },
    [persistState]
  );

  const updateTimestamp = useCallback(
    (timestamp: number) => {
      if (!currentVideoId) return;
      persistState(currentVideoId, currentPosition, timestamp);
    },
    [currentVideoId, currentPosition, persistState]
  );

  return {
    currentVideoId,
    currentPosition,
    resumeTimestamp,
    play,
    updateTimestamp,
  };
}
