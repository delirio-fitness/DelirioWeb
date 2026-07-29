# Pipecat voice waveform

## Goal

The voice waveform reacts to the coach audio the user actually hears. It shows
that a session is alive; it is not a speech score, confidence meter, or
diagnostic signal.

## Production data flow

1. `useVoiceSession` connects through `@pipecat-ai/client-js` and Daily.
2. Pipecat invokes `onTrackStarted` with the remote coach `MediaStreamTrack`.
3. `usePipecatFrequencyListener` connects that track to an `AnalyserNode`,
   samples its FFT, and groups the bins into normalized bars.
4. `VoiceFrequencyWaveform` renders those bars in `SessionStudio`.

The audio remains attached to the existing `HTMLAudioElement` for playback.
Analysis is a parallel, read-only branch and does not change volume.

## Configuration and usage

```ts
const frequency = usePipecatFrequencyListener({
  barCount: 16,
  magnitudeScalar: 1.6,
  fftSize: 256,
  framesPerSecond: 30,
});

// Inside callbacks.onTrackStarted:
if (track.kind === 'audio' && participant && !participant.local) {
  frequency.attachTrack(track);
}
```

`magnitudeScalar` is visual gain. Increasing it makes quiet speech more visible
but never amplifies playback. Output is clamped to 0-100. Production currently
uses `1.6` in `useVoiceSession.ts`.

## Connecting fallback

The waveform appears when connection begins. Before a remote track exists,
`VoiceFrequencyWaveform` shows a restrained synthetic pattern. As soon as remote
audio attaches, the bars switch to measured magnitudes.

## Limitations

- Web Audio and `MediaStreamTrack` support are required for live analysis.
- Autoplay rules can suspend Web Audio until the browser receives a user gesture.
- Values are derived locally from decoded audio; no custom Pipecat FFT websocket
  message is required.
- Acoustic energy does not indicate whether a response is correct or complete.
- Updates are capped at 30 FPS to control landing-page rendering cost.

If a future Pipecat transport sends server-calculated frequency frames, adapt
`usePipecatFrequencyListener` while keeping `VoiceFrequencyWaveform` unchanged.
