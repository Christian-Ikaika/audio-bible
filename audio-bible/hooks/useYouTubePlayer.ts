"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: typeof YT;
  onYouTubeIframeAPIReady?(): void;
  }
}

export type YTPlayerState =
  | "unstarted"
  | "ended"
  | "playing"
  | "paused"
  | "buffering"
  | "cued";

const STATE_MAP: Record<number, YTPlayerState> = {
  [-1]: "unstarted",
  [0]: "ended",
  [1]: "playing",
  [2]: "paused",
  [3]: "buffering",
  [5]: "cued",
};

interface UseYouTubePlayerOptions {
  containerId: string;
  videoId: string | null;
  startSeconds?: number;
  onStateChange?: (state: YTPlayerState) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

export function useYouTubePlayer({
  containerId,
  videoId,
  startSeconds = 0,
  onStateChange,
  onTimeUpdate,
  onEnded,
}: UseYouTubePlayerOptions) {
  const playerRef = useRef<YT.Player | null>(null);
  const [playerState, setPlayerState] = useState<YTPlayerState>("unstarted");
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingVideoRef = useRef<{ videoId: string; startSeconds: number } | null>(null);

  // Load the IFrame API script once
  useEffect(() => {
    if (window.YT?.Player) {
      return; // Already loaded
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }, []);

  const initPlayer = useCallback(() => {
    if (!videoId) return;
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    playerRef.current = new window.YT.Player(containerId, {
      videoId,
      playerVars: {
        autoplay: 1,
        start: Math.floor(startSeconds),
        controls: 0,      // Hide YouTube controls (we render our own)
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        fs: 0,
      },
      events: {
        onReady: () => setIsReady(true),
        onStateChange: (e: YT.OnStateChangeEvent) => {
          const state = STATE_MAP[e.data] ?? "unstarted";
          setPlayerState(state);
          onStateChange?.(state);
          if (state === "ended") onEnded?.();
        },
      },
    });
  }, [containerId, videoId, startSeconds, onStateChange, onEnded]);

  // Init player after API is ready
  useEffect(() => {
    if (!videoId) return;

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        initPlayer();
      };
    }

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Poll time while playing
  useEffect(() => {
    if (playerState === "playing" && isReady) {
      tickRef.current = setInterval(() => {
        const ct = playerRef.current?.getCurrentTime() ?? 0;
        const dur = playerRef.current?.getDuration() ?? 0;
        setCurrentTime(ct);
        setDuration(dur);
        onTimeUpdate?.(ct, dur);
      }, 1000);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [playerState, isReady, onTimeUpdate]);

  const playVideo = useCallback(
    (newVideoId: string, fromSeconds = 0) => {
      if (!isReady || !playerRef.current) {
        pendingVideoRef.current = { videoId: newVideoId, startSeconds: fromSeconds };
        return;
      }
      playerRef.current.loadVideoById({ videoId: newVideoId, startSeconds: fromSeconds });
    },
    [isReady]
  );

  // Handle pending video once ready
  useEffect(() => {
    if (isReady && pendingVideoRef.current) {
      const { videoId: vid, startSeconds: ss } = pendingVideoRef.current;
      pendingVideoRef.current = null;
      playerRef.current?.loadVideoById({ videoId: vid, startSeconds: ss });
    }
  }, [isReady]);

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    if (playerState === "playing") {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [playerState]);

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
  }, []);

  const getAvailablePlaybackRates = useCallback((): number[] => {
    return playerRef.current?.getAvailablePlaybackRates() ?? [1];
  }, []);

  return {
    isReady,
    playerState,
    currentTime,
    duration,
    playVideo,
    togglePlayPause,
    seekTo,
    setPlaybackRate,
    getAvailablePlaybackRates,
  };
}
