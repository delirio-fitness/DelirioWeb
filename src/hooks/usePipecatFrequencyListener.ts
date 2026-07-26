import { useCallback, useEffect, useRef, useState } from 'react';

export type PipecatFrequencyListenerOptions = {
  /** Number of visual frequency bands to produce. Defaults to 16. */
  barCount?: number;
  /**
   * Linear gain applied to every measured frequency magnitude before clamping.
   * `1` is the source magnitude; values above `1` make quiet voices more visible.
   * This affects only the graphic and never changes playback volume.
   */
  magnitudeScalar?: number;
  /** FFT window size supported by AnalyserNode. Defaults to 256. */
  fftSize?: number;
  /** UI update ceiling. Defaults to 30 frames per second. */
  framesPerSecond?: number;
};

const DEFAULT_BAR_COUNT = 16;

/**
 * Collapses raw FFT bins into a stable number of visual bands.
 * Exported separately so scaling behavior can be verified without browser audio.
 */
export function mapFrequencyBins(
  bins: Uint8Array,
  barCount = DEFAULT_BAR_COUNT,
  magnitudeScalar = 1,
): number[] {
  const count = Math.max(1, Math.floor(barCount));
  const scalar = Number.isFinite(magnitudeScalar) ? Math.max(0, magnitudeScalar) : 1;

  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor((index * bins.length) / count);
    const end = Math.max(start + 1, Math.floor(((index + 1) * bins.length) / count));
    let total = 0;
    for (let bin = start; bin < Math.min(end, bins.length); bin += 1) total += bins[bin];
    const average = bins.length ? total / Math.max(1, Math.min(end, bins.length) - start) : 0;
    return Math.min(100, Math.round((average / 255) * 100 * scalar));
  });
}

/**
 * Listens to a remote Pipecat MediaStreamTrack and derives display-friendly FFT
 * magnitudes from it. Pipecat/Daily already delivers the decoded coach audio via
 * `onTrackStarted`; analysing that track avoids inventing a second websocket
 * message format and works alongside normal audio playback.
 *
 * Usage:
 * 1. Call `attachTrack(track)` for a remote audio track in Pipecat's
 *    `onTrackStarted` callback.
 * 2. Render `levels` with a waveform component.
 * 3. Call `detachTrack()` when the transport disconnects. Unmount cleanup is
 *    automatic.
 *
 * Limitations:
 * - Requires browser Web Audio API support and an audio track decoded by the
 *   active Pipecat transport.
 * - The values are local FFT magnitudes, not semantic speech confidence and not
 *   frequency packets sent directly by the Pipecat server.
 * - Browser autoplay policy may suspend AudioContext until a user gesture; the
 *   hook attempts to resume it when a track is attached.
 */
export function usePipecatFrequencyListener(options: PipecatFrequencyListenerOptions = {}) {
  const {
    barCount = DEFAULT_BAR_COUNT,
    magnitudeScalar = 1.6,
    fftSize = 256,
    framesPerSecond = 30,
  } = options;
  const [levels, setLevels] = useState<number[]>(() => Array(Math.max(1, barCount)).fill(0));
  const [isListening, setIsListening] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const trackEndedHandlerRef = useRef<(() => void) | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);

  const detachTrack = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    if (trackRef.current && trackEndedHandlerRef.current) {
      trackRef.current.removeEventListener('ended', trackEndedHandlerRef.current);
    }
    trackRef.current = null;
    trackEndedHandlerRef.current = null;
    sourceRef.current = null;
    analyserRef.current = null;
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== 'closed') void context.close();
    setIsListening(false);
    setLevels(Array(Math.max(1, Math.floor(barCount))).fill(0));
  }, [barCount]);

  const attachTrack = useCallback((track: MediaStreamTrack) => {
    detachTrack();
    if (track.kind !== 'audio' || typeof window === 'undefined' || !window.AudioContext) return;

    const context = new window.AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = 0.72;
    const source = context.createMediaStreamSource(new MediaStream([track]));
    source.connect(analyser);
    contextRef.current = context;
    sourceRef.current = source;
    analyserRef.current = analyser;
    trackRef.current = track;
    const handleTrackEnded = () => detachTrack();
    trackEndedHandlerRef.current = handleTrackEnded;
    track.addEventListener('ended', handleTrackEnded, { once: true });
    setIsListening(true);
    void context.resume();

    const bins = new Uint8Array(analyser.frequencyBinCount);
    const frameInterval = 1000 / Math.max(1, framesPerSecond);
    const sample = (timestamp: number) => {
      if (analyserRef.current !== analyser) return;
      if (timestamp - lastUpdateRef.current >= frameInterval) {
        analyser.getByteFrequencyData(bins);
        setLevels(mapFrequencyBins(bins, barCount, magnitudeScalar));
        lastUpdateRef.current = timestamp;
      }
      animationRef.current = requestAnimationFrame(sample);
    };
    animationRef.current = requestAnimationFrame(sample);
  }, [barCount, detachTrack, fftSize, framesPerSecond, magnitudeScalar]);

  useEffect(() => detachTrack, [detachTrack]);

  return { levels, isListening, attachTrack, detachTrack };
}
