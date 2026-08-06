import { coachProfiles, type CoachId } from '../../content/landingContent';

/**
 * The coaches, introduced rather than demonstrated.
 *
 * This section used to host a live voice and text trial run from the website.
 * That demo is retired, so the section now presents Iris and Reed as the two
 * styles a visitor chooses between inside the app, and asks nothing of them
 * here — no coach to pick, no session to start.
 */

const coachIntros: Record<CoachId, { descriptor: string; description: string }> = {
  iris: {
    descriptor: 'RELATIONAL / ATTENTIVE',
    description: 'Warm, patient, and understanding. Iris adapts gently when your energy, confidence, or day changes.',
  },
  reed: {
    descriptor: 'FOCUSED / DIRECT',
    description: 'Structured, direct, and schedule-driven. Reed keeps commitments clear and helps you follow the plan.',
  },
};

export function CoachIntroSection() {
  return (
    <section id="coaches-section" className="d3-coach-intro" aria-labelledby="coach-intro-title">
      <span id="coaches" className="coach-intro__anchor" aria-hidden="true" />
      <div className="coach-intro__shell">
        <div className="coach-intro__intro">
          <h2 id="coach-intro-title">MEET IRIS<br />AND REED.</h2>
          <p>Two coaching styles working from the same training context. You choose the one that fits when you set up Delirio.</p>
        </div>

        <div className="coach-intro__choices">
          {(['iris', 'reed'] as const).map((id) => {
            const { descriptor, description } = coachIntros[id];
            const coach = coachProfiles[id];
            return (
              <article className="coach-intro__card" key={id}>
                <span className="coach-intro__card-profile">
                  <img src={coach.avatar} alt={`${coach.name}, a Delirio AI coach`} />
                  <span className="coach-intro__card-description">{description}</span>
                </span>
                <span className="coach-intro__card-meta">
                  <b>{coach.name.toUpperCase()}</b>
                  <small>{descriptor}</small>
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
