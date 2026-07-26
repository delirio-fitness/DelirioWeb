const proofItems = [
  ['01', 'ASK IN THE MOMENT', 'Speak while the context is still fresh.'],
  ['02', 'HEAR THE ADJUSTMENT', 'The coach explains the next safe action.'],
  ['03', 'RETURN TO THE SET', 'Continue only when the user is ready.'],
] as const;

const waveHeights = [18, 38, 60, 32, 74, 46, 24, 55, 34, 68, 42, 20];

export function VoiceCoachingSection({ onStartVoice }: { onStartVoice: () => void }) {
  return (
    <section className="d3-voice-product" aria-labelledby="voice-product-title">
      <div className="d3-voice-editorial">
        <h2 id="voice-product-title">WHEN A SET FEELS<br />WRONG, TALK IT<br />THROUGH.</h2>
        <p className="d3-voice-body">Start a live voice coaching session without leaving the workout. Ask what changed, hear the adjustment, and return to the set with a clear next move.</p>
        <a className="d3-voice-cta" href="#coaches" onClick={onStartVoice}>START VOICE SESSION</a>
        
        {/*<p className="d3-voice-permission">MICROPHONE ACCESS IS REQUESTED ONLY AFTER THIS ACTION.</p> */} 
        
        <div className="d3-voice-rule" aria-hidden="true" />
        <div className="d3-voice-proofs">
          {proofItems.map(([number, title, copy]) => (
            <article key={number}><strong>{number}</strong><div><h3>{title}</h3><p>{copy}</p></div></article>
          ))}
        </div>
      </div>

      <div className="d3-voice-visuals">
        <div className="d3-live-context">
          <h3>LIVE CONTEXT</h3>
          <div><strong className="is-user">YOU</strong><p>“My knee feels off on the last set.”</p></div>
          <div><strong className="is-iris">IRIS</strong><p>“Stop the set. Lower the load, shorten the depth, and tell me whether the discomfort changes.”</p></div>
          <div><strong>NEXT MOVE</strong><p><b>Supported split squat</b><b>Reduced load</b><b>Manual continuation</b></p></div>
        </div>

        <div className="d3-voice-phone" aria-label="Illustration of an in-app voice coaching session with Iris">
          <div className="d3-phone-shell">
            <div className="d3-phone-island" aria-hidden="true" />
            <span className="d3-phone-time">9:41</span><span className="d3-phone-status">••• 100%</span>
            <p className="d3-phone-kicker">VOICE COACHING / IN APP</p>
            <div className="d3-phone-avatar">I</div>
            <h3>IRIS</h3><small>LIVE COACHING SESSION</small><strong className="d3-phone-duration">12:48</strong>
            <div className="d3-phone-wave" aria-hidden="true">{waveHeights.map((height, index) => <i key={index} style={{ height }} />)}</div>
            <div className="d3-phone-actions"><span>MUTE</span><span>AUDIO</span><span className="is-end">END</span></div>
            <p className="d3-phone-permission">MICROPHONE ACCESS ONLY AFTER START</p>
          </div>
        </div>
      </div>
    </section>
  );
}
