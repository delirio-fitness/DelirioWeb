import coachIMessageThread from '../../images/appScreenshots/coachIMessageThread.png';
import postWorkoutText from '../../images/appScreenshots/postWorkoutText.png';
import { PhoneScreenshotFrame } from './PhoneScreenshotFrame';

const proofPoints = [
  ['01', 'FULL CONTEXT IN APP', 'Review the complete thread and the reason behind a change.'],
  ['02', 'OPTIONAL SMS', 'Receive short reminders and follow-ups only when you opt in.'],
  ['03', 'YOU CONTROL THE CHANNEL', 'Pause messages or return to the app whenever you prefer.'],
] as const;

export function MessagingThreadSection() {
  return (
    <section className="d3-messaging" aria-labelledby="messaging-title">
      <div className="d3-messaging-editorial">
        <h2 id="messaging-title">ONE COACH.<br />PICK UP WHEREVER<br />YOU ARE.</h2>
        <p className="d3-messaging-body">Keep the full conversation inside Delirio, or opt in to SMS for a brief follow-up when opening the app is inconvenient. Your context carries forward, and you control where messages appear.</p>
        <div className="d3-messaging-rule" aria-hidden="true" />
        <div className="d3-messaging-proofs">
          {proofPoints.map(([number, title, copy]) => (
            <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>
          ))}
        </div>
      </div>

      <div className="d3-messaging-visuals" aria-label="The same coaching conversation in Delirio and over SMS">
        <div className="d3-message-device is-app">
          <PhoneScreenshotFrame
            src={coachIMessageThread}
            alt="iMessage coaching conversation with Iris about returning to overhead pressing"
          />
        </div>

        <div className="d3-message-device is-sms">
          <PhoneScreenshotFrame
            src={postWorkoutText}
            alt="Post-workout coaching conversation with Iris in Delirio"
          />
        </div>
      </div>
    </section>
  );
}
