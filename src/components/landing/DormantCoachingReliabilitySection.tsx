/**
 * DORMANT LANDING PAGE SECTION
 *
 * Purpose
 * This component preserves the former AI coaching reliability section that
 * explained Delirio's test, tune, and retest process across planning, text,
 * voice, and live workout guidance.
 *
 * Current product decision
 * The section was removed from the rendered landing page to reduce page
 * length and repeated explanation. It is intentionally not imported or
 * rendered by Landing.tsx. Keeping it here allows the team to reconsider the
 * trust narrative later without rebuilding the infographic and copy.
 *
 * Reuse guidance
 * Before restoring this component, confirm that the claims still match the
 * current evaluation, training, and release process. The surrounding CSS
 * currently remains in design3.css under the d3-memory selectors. If those
 * styles are removed during a future cleanup, they must be restored or
 * redesigned before this component returns to production.
 *
 * Important limitation
 * This is preserved source, not an active product promise. Do not interpret
 * its presence in the repository as evidence that every described evaluation
 * process is currently operational. Product, safety, and engineering owners
 * should review the copy before any future release.
 */

const reliabilitySteps = [
  ['01', 'TEST EVERY MODE', 'Evaluate how the AI coaches plan, respond through text and voice, interpret live movement, and adjust what happens next.'],
  ['02', 'CHECK THE GUIDANCE', 'Review whether suggestions are relevant, understandable, within fitness scope, and appropriately cautious when context is incomplete.'],
  ['03', 'TUNE WITH CONTROL', 'Selected failure patterns become controlled cases for training and fine-tuning the AI coaches, not automatic lessons from a single conversation.'],
  ['04', 'RETEST EVERY CHANGE', 'After the AI coaches are trained or fine-tuned, run the full evaluation suite again across text, voice, planning, and live sessions.'],
] as const;

export function DormantCoachingReliabilitySection() {
  return (
    <section className="d3-memory" aria-labelledby="memory-title">
      <div className="d3-memory-intro">
        <h2 id="memory-title">CLEAR ABOUT WHAT<br />IS KNOWN. CLEAR ABOUT<br />WHAT ISN'T.</h2>
        <p>The AI coaches do more than count reps. They can help shape a plan, respond through text or voice, interpret a live session, and suggest what should happen next. That standard matters most when your schedule, energy, strength, or confidence changes. Every mode is evaluated for relevance, consistency, scope, and uncertainty before and after the AI coaches are trained or fine-tuned.</p>
      </div>
      <div className="d3-loop">
        <div className="d3-memory-core">TEST<br />TUNE<br />RETEST</div>
        <i className="d3-memory-node is-top" aria-hidden="true" />
        <i className="d3-memory-node is-right" aria-hidden="true" />
        <i className="d3-memory-node is-bottom" aria-hidden="true" />
        <i className="d3-memory-node is-left" aria-hidden="true" />
        {reliabilitySteps.map(([number, title, copy], index) => (
          <article className={`step-${index + 1}`} key={number}>
            <span>{number}</span>
            <div><h3>{title}</h3><p>{copy}</p></div>
          </article>
        ))}
      </div>
      <div className="d3-memory-close">
        <h3>THE STANDARD ISN'T WHETHER AN AI COACH CAN ANSWER. IT'S WHETHER THE GUIDANCE DESERVES TO BE USED.</h3>
        <p>Relevant in text. Composed in voice. Grounded during training. Clear about limits everywhere.</p>
      </div>
    </section>
  );
}
