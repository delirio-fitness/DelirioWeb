import type { ReactNode } from 'react';

const proofPoints = [
  ['01', 'IN-APP MESSAGE', 'Full context, coach identity, and the complete thread.'],
  ['02', 'SMS FOLLOW-UP', 'Short, consented reminders and plan changes.'],
  ['03', 'RETURN TO THE APP', 'Sensitive detail and full plan review live in Delirio.'],
] as const;

function PhoneChrome({ children }: { children: ReactNode }) {
  return (
    <div className="d3-message-phone-shell">
      <div className="d3-message-status"><span>9:41</span><span>••• 100%</span></div>
      <span className="d3-message-island" aria-hidden="true" />
      {children}
    </div>
  );
}

export function MessagingThreadSection() {
  return (
    <section className="d3-messaging" aria-labelledby="messaging-title">
      <div className="d3-messaging-editorial">
        <p className="d3-messaging-kicker">MESSAGING / IN APP + SMS</p>
        <h2 id="messaging-title">ONE COACHING<br />THREAD. TWO PLACES<br />TO TYPE.</h2>
        <p className="d3-messaging-body">Use the full conversation inside Delirio, or opt in to SMS for a quick follow-up when opening the app is inconvenient. The coaching relationship stays recognizable across both surfaces.</p>
        <div className="d3-messaging-rule" aria-hidden="true" />
        <div className="d3-messaging-proofs">
          {proofPoints.map(([number, title, copy]) => (
            <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>
          ))}
        </div>
      </div>

      <div className="d3-messaging-visuals" aria-label="The same coaching conversation in Delirio and over SMS">
        <div className="d3-message-device is-app">
          <PhoneChrome>
            <div className="d3-app-thread">
              <small>IN-APP MESSAGE</small>
              <header><span className="d3-thread-avatar">I</span><div><b>IRIS</b><small>ACTIVE NOW</small></div></header>
              <div className="d3-chat-bubble is-user">My knee feels off on the last set.</div>
              <div className="d3-chat-bubble">Stop the set. Lower the load and shorten the depth. Tell me if the discomfort changes.</div>
              <div className="d3-chat-bubble is-user">Better now.</div>
              <div className="d3-chat-bubble">Logged. I’ll adjust the next session.</div>
              <div className="d3-thread-composer"><span>Message Iris…</span><b>→</b></div>
            </div>
          </PhoneChrome>
        </div>

        <div className="d3-message-device is-sms">
          <PhoneChrome>
            <div className="d3-sms-thread">
              <small>SMS / OPTED IN</small>
              <header><span>‹</span><div><b>DELIRIO COACH</b><small>AUTOMATED COACHING MESSAGES</small></div></header>
              <div className="d3-sms-bubble">Tomorrow’s lower-body session has been adjusted after today’s knee feedback.</div>
              <div className="d3-sms-bubble is-user">Can I swap squats for another movement?</div>
              <div className="d3-sms-bubble">Yes. I replaced them with supported split squats. Open Delirio to review the updated plan.</div>
              <p className="d3-sms-optout">DELIRIO • REPLY STOP TO OPT OUT</p>
              <div className="d3-thread-composer"><span>Text Message</span><b>↑</b></div>
            </div>
          </PhoneChrome>
        </div>
      </div>
    </section>
  );
}
