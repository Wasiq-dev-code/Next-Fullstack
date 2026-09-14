'use client';

import { useEffect, useRef, useState } from 'react';

type EngineState = 'idle' | 'extracting' | 'downloading' | 'processing' | 'ready' | 'error';

async function extractAudioFromVideo(videoSrc: string): Promise<Float32Array> {
  const response = await fetch(videoSrc, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Video could not be loaded (HTTP ${response.status}).`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const AudioContextCtor =
    window.AudioContext || (window as any).webkitAudioContext;

  if (!AudioContextCtor) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  const audioContext = new AudioContextCtor({ sampleRate: 16000 });

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    return audioBuffer.getChannelData(0);
  } catch {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = videoSrc;

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error('Video could not be loaded for audio extraction.'));
    });

    const source = audioContext.createMediaElementSource(video);
    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);
    source.connect(audioContext.destination);

    const chunks: BlobPart[] = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

    const recorder = new MediaRecorder(
      destination.stream,
      mimeType ? { mimeType } : undefined,
    );

    await new Promise<void>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onerror = () => reject(new Error('Audio capture failed.'));
      recorder.onstop = () => resolve();

      recorder.start();
      video.play().catch(reject);
      video.onended = () => recorder.stop();
    });

    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
    const blobBuffer = await blob.arrayBuffer();
    const decoded = await audioContext.decodeAudioData(blobBuffer.slice(0));
    return decoded.getChannelData(0);
  } finally {
    await audioContext.close();
  }
}

// How many ms to wait between revealing each character of the typewriter effect.
// Lower = faster reveal. This runs independently of how fast tokens actually arrive.
const TYPEWRITER_INTERVAL_MS = 18;

export default function VideoPlayerWithAi({ videoSrc }: { videoSrc: string }) {
  const [status, setStatus] = useState<EngineState>('idle');
  const [downloadPct, setDownloadPct] = useState<number>(0);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [errorText, setErrorText] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Target text is whatever has streamed in so far; the typewriter timer
  // drains toward it character-by-character, independent of arrival speed.
  const targetTextRef = useRef<string>('');
  const typewriterIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTypewriter = () => {
    if (typewriterIntervalRef.current) return;
    typewriterIntervalRef.current = setInterval(() => {
      setDisplayedText((prev) => {
        const target = targetTextRef.current;
        if (prev.length >= target.length) return prev;
        return target.slice(0, prev.length + 1);
      });
    }, TYPEWRITER_INTERVAL_MS);
  };

  const stopTypewriter = () => {
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const worker = new Worker(new URL('../workers/transcribe.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent) => {
      const { lifecycle, pct, text, chunks, error } = event.data ?? {};

      if (lifecycle === 'downloading') {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setStatus('downloading');
        setDownloadPct((prev) => Math.max(prev, Math.min(90, Number(pct) || prev)));
        return;
      }

      if (lifecycle === 'processing') {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setStatus('processing');
        setDownloadPct(95);
        startTypewriter();
        return;
      }

      // Live text arriving as the model generates it. We just update the
      // target; the typewriter interval handles revealing it on screen.
      if (lifecycle === 'partial') {
        setStatus('processing');
        targetTextRef.current = text || '';
        startTypewriter();
        return;
      }

      if (lifecycle === 'completed') {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        const formatted = (chunks ?? [])
          .map((c: any) => c?.text ?? '')
          .filter((t: string) => t && t.trim().length > 0);

        setTranscript(formatted);
        setDownloadPct(100);

        // Make sure the full final text is the typewriter's target, then
        // let it finish draining rather than cutting it off abruptly.
        const finalText = formatted.join(' ').trim() || targetTextRef.current;
        targetTextRef.current = finalText;

        if (formatted.length > 0) {
          setStatus('ready');
        } else {
          setStatus('error');
          setErrorText('No transcript could be generated from this video.');
          stopTypewriter();
        }
        return;
      }

      if (lifecycle === 'failed') {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        stopTypewriter();
        setStatus('error');
        setErrorText(error || 'Transcription failed.');
      }
    };

    worker.onerror = () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      stopTypewriter();
      setStatus('error');
      setErrorText('The transcription worker crashed. Please check your browser console (F12).');
    };

    workerRef.current = worker;

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      stopTypewriter();
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Once the typewriter has fully caught up to the final transcript, stop the timer.
  useEffect(() => {
    if (status === 'ready' && displayedText.length >= targetTextRef.current.length) {
      stopTypewriter();
    }
  }, [status, displayedText]);

  const startTranscription = async () => {
    if (!videoSrc || !workerRef.current) {
      setStatus('error');
      setErrorText('Transcription worker is not ready yet.');
      return;
    }

    setTranscript([]);
    setDisplayedText('');
    targetTextRef.current = '';
    setErrorText(null);
    setStatus('extracting');
    setDownloadPct(10);

    try {
      const audioData = await extractAudioFromVideo(videoSrc);

      setStatus('downloading');
      setDownloadPct(30);

      // Simulate smooth progress forward while Hugging Face fetches model files
      progressIntervalRef.current = setInterval(() => {
        setDownloadPct((prev) => {
          if (prev >= 88) return prev;
          return prev + 2;
        });
      }, 600);

      workerRef.current.postMessage({
        audioArray: audioData,
        modelName: 'Xenova/whisper-tiny.en',
      });
    } catch (err) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      stopTypewriter();
      setStatus('error');
      setErrorText(err instanceof Error ? err.message : 'Transcription failed.');
    }
  };

  const showLiveText =
    (status === 'processing' || status === 'ready') && displayedText.length > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#171922] p-4 text-white shadow-xl">
      <button
        type="button"
        onClick={startTranscription}
        disabled={status === 'extracting' || status === 'downloading' || status === 'processing'}
        className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition ${
          status === 'idle'
            ? 'bg-violet-600 hover:bg-violet-500'
            : status === 'extracting'
            ? 'cursor-wait bg-blue-600 animate-pulse'
            : status === 'downloading'
            ? 'cursor-wait bg-amber-600'
            : status === 'processing'
            ? 'animate-pulse bg-purple-600'
            : status === 'ready'
            ? 'bg-emerald-600'
            : 'bg-red-600'
        }`}
      >
        {status === 'idle' && 'Generate transcription'}
        {status === 'extracting' && 'Extracting audio from video...'}
        {status === 'downloading' && `Downloading AI model (${downloadPct}%)`}
        {status === 'processing' && 'Transcribing audio...'}
        {status === 'ready' && 'Transcription ready'}
        {status === 'error' && 'Retry transcription'}
      </button>

      {errorText && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {errorText}
        </p>
      )}

      {showLiveText && (
        <div className="mt-4 rounded-xl border border-white/10 bg-[#20222b] p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet-300">
            {status === 'ready' ? 'Transcript' : 'Transcribing…'}
          </h3>
          <p className="whitespace-pre-wrap text-sm text-gray-200">
            {displayedText}
            {status === 'processing' && <span className="animate-pulse">▍</span>}
          </p>
        </div>
      )}
    </div>
  );
}