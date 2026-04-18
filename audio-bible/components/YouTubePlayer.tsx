"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayerInstance }) => void;
            onStateChange?: (e: { data: number; target: YTPlayerInstance }) => void;
            onError?: (e: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YTPlayerInstance {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  loadVideoById(opts: { videoId: string; startSeconds?: number }): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  getAvailablePlaybackRates(): number[];
  destroy(): void;
}

export type PlayerState = "unstarted" | "ended" | "playing" | "paused" | "buffering" | "cued";

const STATE_MAP: Record<number, PlayerState> = {
  [-1]: "unstarted",
  [0]: "ended",
  [1]: "playing",
  [2]: "paused",
  [3]: "buffering",
  [5]: "cued",
};

interface Props {
  videoId: string | null;
  startSeconds?: number;
  onReady?: (player: YTPlayerInstance) => void;
  onStateChange?: (state: PlayerState, player: YTPlayerInstance) => void;
  onError?: (code: number) => void;
}

// Track API loading state globally so we don't double-load
let apiLoaded = false;
let apiLoadCallbacks: Array<() => void> = [];

function loadYouTubeAPI(onReady: () => void) {
  if (apiLoaded) {
    onReady();
    return;
  }
  apiLoadCallbacks.push(onReady);
  if (document.getElementById("yt-iframe-api")) return; // script tag already injected

  const tag = document.createElement("script");
  tag.id = "yt-iframe-api";
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = () => {
    apiLoaded = true;
    apiLoadCallbacks.forEach((cb) => cb());
    apiLoadCallbacks = [];
  };
}

export default function YouTubePlayer({
  videoId,
  startSeconds = 0,
  onReady,
  onStateChange,
  onError,
}: Props) {
  const containerId = useId().replace(/:/g, "");
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const prevVideoId = useRef<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    function initPlayer() {
      // If player exists and video changed, load new video
      if (playerRef.current) {
        if (prevVideoId.current !== videoId) {
          prevVideoId.current = videoId;
          playerRef.current.loadVideoById({ videoId: videoId!, startSeconds });
        }
        return;
      }

      prevVideoId.current = videoId;
      playerRef.current = new window.YT.Player(containerId, {
        videoId: videoId!,
        playerVars: {
          autoplay: 1,
          start: Math.floor(startSeconds),
          controls: 0,        // We render our own controls
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,  // Hide annotations
        },
        events: {
          onReady: (e) => onReady?.(e.target),
          onStateChange: (e) => onStateChange?.(STATE_MAP[e.data] ?? "unstarted", e.target),
          onError: (e) => onError?.(e.data),
        },
      });
    }

    loadYouTubeAPI(initPlayer);

    return () => {
      // Don't destroy on videoId change — we reuse the player
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  if (!videoId) return null;

  return (
    // Visually hidden but DOM-present so the IFrame API can find it.
    // The IFrame Player API requires a real element in the DOM.
    <div
      className="yt-hidden-player"
      aria-hidden="true"
    >
      <div id={containerId} />
    </div>
  );
}
