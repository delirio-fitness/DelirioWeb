const CONNECTING_LEVELS = [34, 58, 42, 76, 52, 88, 64, 96, 72, 84, 56, 70, 44, 62, 38, 50];

type VoiceFrequencyWaveformProps = {
  /** Normalized magnitudes (0-100) supplied by usePipecatFrequencyListener. */
  levels: readonly number[];
  /** True after a real remote audio track has been attached to the analyser. */
  isListening: boolean;
};

/**
 * Presentational waveform for the active voice session.
 *
 * While Pipecat is connecting, it uses a restrained synthetic pattern so the
 * session has immediate visual feedback. Once remote audio arrives, inline bar
 * heights come exclusively from the Pipecat frequency listener. This component
 * intentionally knows nothing about transports, sockets, or AudioContext.
 */
export function VoiceFrequencyWaveform({ levels, isListening }: VoiceFrequencyWaveformProps) {
  const visibleLevels = isListening ? levels : CONNECTING_LEVELS;

  return <div
    className={`coach-trial__mock-frequency ${isListening ? 'is-live' : 'is-fallback'}`}
    data-testid="voice-frequency-waveform"
  >
    {visibleLevels.map((height, index) => <i
      key={index}
      style={{
        height: `${Math.max(8, Math.min(100, height))}%`,
        animationDelay: isListening ? undefined : `${index * -70}ms`,
      }}
    />)}
  </div>;
}
