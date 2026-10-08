'use client';

import { RefObject, useEffect } from 'react';

/**
 * Tracks real playback time on a <video> element and reports it to
 * POST /api/videos/:id/watch every ~10s of playing, and when the viewer
 * pauses, finishes, switches tab or leaves.
 *
 * Usage:
 *   const videoRef = useRef<HTMLVideoElement>(null);
 *   useWatchTimeTracker(videoId, videoRef);
 *   <video ref={videoRef} ... />
 */
export function useWatchTimeTracker(
  videoId: string,
  videoRef: RefObject<HTMLVideoElement | null>,
) {
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoId) return;

    let pending = 0;
    let lastTime: number | null = null;

    const flush = () => {
      const seconds = Math.floor(pending);
      if (seconds < 1) return;
      pending -= seconds;
      fetch(`/api/videos/${videoId}/watch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seconds }),
        keepalive: true, // survives page unload
      }).catch(() => {});
    };

    const onTimeUpdate = () => {
      if (lastTime !== null) {
        const delta = el.currentTime - lastTime;
        // ignore seeks/jumps: only count small forward steps
        if (delta > 0 && delta < 2) pending += delta;
      }
      lastTime = el.currentTime;
      if (pending >= 10) flush();
    };

    const onPlay = () => {
      lastTime = el.currentTime;
    };
    const onStop = () => {
      lastTime = null;
      flush();
    };
    const onSeeking = () => {
      lastTime = null;
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') onStop();
    };

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onStop);
    el.addEventListener('ended', onStop);
    el.addEventListener('seeking', onSeeking);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onStop);

    return () => {
      flush();
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onStop);
      el.removeEventListener('ended', onStop);
      el.removeEventListener('seeking', onSeeking);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onStop);
    };
  }, [videoId, videoRef]);
}