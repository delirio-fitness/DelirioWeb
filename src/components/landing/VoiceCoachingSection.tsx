const proofItems = [
  ['01', 'ASK IN THE MOMENT', 'Speak while the context is still fresh.'],
  ['02', 'HEAR WHAT CHANGES', 'The coach explains the recommendation and why.'],
  ['03', 'CHOOSE THE NEXT MOVE', 'Continue, adjust, or stop when you need to.'],
] as const;

const waveHeights = [18, 38, 60, 32, 74, 46, 24, 55, 34, 68, 42, 20];

export function VoiceCoachingSection({ onStartVoice }: { onStartVoice: () => void }) {
  return (
    <section className="d3-voice-product" aria-labelledby="voice-product-title">
      <div className="d3-voice-editorial">
        <h2 id="voice-product-title">NEED CLARITY<br />MID-SET? PAUSE<br />AND ASK.</h2>
        <p className="d3-voice-body">Ask what changed while the session is still fresh. Hear the recommendation, understand the reason, and choose what you want to do next.</p>
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
          <div><strong className="is-user">YOU</strong><p>“The last two reps felt less steady.”</p></div>
          <div><strong className="is-iris">IRIS</strong><p>“Pause here. Take 20 seconds more rest, then decide whether you want to keep the load or reduce it.”</p></div>
          <div><strong>NEXT MOVE</strong><p><b>20 seconds more rest</b><b>Keep or reduce the load</b><b>Continue when ready</b></p></div>
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
