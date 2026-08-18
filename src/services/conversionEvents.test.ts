import { recordPageView, recordQualifiedAction, resetPageView, resetQualifiedActions } from './conversionEvents';
import { sendConversion } from './conversionBeacon';
import { DEFAULT_LANDING_VARIANT } from '../config/experiment';

jest.mock('./conversionBeacon', () => ({ sendConversion: jest.fn() }));

const send = jest.mocked(sendConversion);

describe('recordQualifiedAction', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    resetQualifiedActions();
    resetPageView();
  });

  // Nothing here sets `?v=`, so the cell is whichever one ships. Asserting the
  // constant rather than the letter keeps this about the attachment.
  it('reports the trigger with the experiment cell attached', () => {
    expect(recordQualifiedAction('store_click')).toBe(true);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: 'store_click', variant: DEFAULT_LANDING_VARIANT }),
    );
  });

  it('flags the first action of a visit, so Lead counts visitors', () => {
    recordQualifiedAction('store_click');

    expect(send.mock.calls[0][0].firstOfVisit).toBe(true);
  });

  /** A visitor who clicks the hero button and then the footer badge is one Lead. */
  it('ignores a repeat of the same trigger', () => {
    expect(recordQualifiedAction('store_click')).toBe(true);
    expect(recordQualifiedAction('store_click')).toBe(false);

    expect(send).toHaveBeenCalledTimes(1);
  });

  it('gives the action its own event ID', () => {
    recordQualifiedAction('store_click');

    expect(send.mock.calls[0][0].eventId).toEqual(expect.any(String));
  });

  it('attaches the campaign that paid for the click', () => {
    window.sessionStorage.setItem(
      'delirio:attribution',
      JSON.stringify({ campaign: 'glp1_v3', source: 'meta' }),
    );

    recordQualifiedAction('store_click');

    expect(send.mock.calls[0][0].attribution).toMatchObject({
      campaign: 'glp1_v3',
      source: 'meta',
    });
  });

  /**
   * The waitlist gate and its six questions are gone, so nothing on the site
   * asks the visitor about themselves any more. These names are pinned as
   * refused anyway: an event that can only fire once someone has answered a
   * health question reports that health by correlation, whatever it is named and
   * however tame the questions look, so the trigger union is where that rule is
   * enforced if questions ever come back.
   */
  it('accepts no trigger that would fire downstream of a health question', () => {
    // @ts-expect-error answering a questionnaire is not a reportable action.
    expect(() => recordQualifiedAction('quiz_completed')).not.toThrow();
    // @ts-expect-error an email box unlocked by answers reports those answers.
    expect(() => recordQualifiedAction('questionnaire_email_submitted')).not.toThrow();
  });

  it('no longer accepts the retired waitlist triggers', () => {
    // @ts-expect-error there is no gate to open; every CTA goes to the store.
    expect(() => recordQualifiedAction('waitlist_started')).not.toThrow();
    // @ts-expect-error the site collects no email addresses at all now.
    expect(() => recordQualifiedAction('email_submitted')).not.toThrow();
  });

  it('no longer accepts the retired website coaching demos as triggers', () => {
    // @ts-expect-error the voice demo was removed with the coaching feature.
    expect(() => recordQualifiedAction('voice_demo_started')).not.toThrow();
    // @ts-expect-error the text demo was removed with the coaching feature.
    expect(() => recordQualifiedAction('text_demo_engaged')).not.toThrow();
  });

  /**
   * A page load is not a qualified action, so the trigger union must keep
   * refusing it — the separate `recordPageView` below is the only way in.
   */
  it('does not accept the page view, which costs the visitor nothing', () => {
    // @ts-expect-error arriving on the page is model input, not a conversion.
    expect(() => recordQualifiedAction('page_view')).not.toThrow();
  });

  /**
   * The site asks for no address anywhere, so there is none to attach — and the
   * beacon has no field to carry one. Pinned because the previous shape did send
   * a hashed email, and re-adding it means re-reading the privacy policy rather
   * than passing a second argument.
   */
  it('carries no email, because nothing on the site collects one', () => {
    // @ts-expect-error no trigger takes an address any more.
    recordQualifiedAction('store_click', 'person@example.com');

    expect(send.mock.calls[0][0]).not.toHaveProperty('email');
  });
});

describe('recordPageView', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    resetQualifiedActions();
    resetPageView();
  });

  it('reports the landing with the experiment cell and campaign attached', () => {
    window.sessionStorage.setItem(
      'delirio:attribution',
      JSON.stringify({ campaign: 'glp1_v3', source: 'meta' }),
    );

    expect(recordPageView()).toBe(true);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: 'page_view',
        variant: DEFAULT_LANDING_VARIANT,
        attribution: expect.objectContaining({ campaign: 'glp1_v3', source: 'meta' }),
      }),
    );
  });

  it('reports once per visit', () => {
    expect(recordPageView()).toBe(true);
    expect(recordPageView()).toBe(false);

    expect(send).toHaveBeenCalledTimes(1);
  });

  /**
   * The regression this whole split exists to prevent.
   *
   * `firstOfVisit` is what licenses the server to send the standard `Lead`, and a
   * page view precedes every CTA by definition. If it were recorded as a
   * qualified action, `store_click` would arrive flagged `false` and `Lead` would
   * stop being reported entirely — visibly only as a number that never moves in
   * Events Manager, which is the kind of failure nobody catches.
   */
  it('never consumes the visit\'s first qualified action, so Lead still fires', () => {
    recordPageView();
    recordQualifiedAction('store_click');

    expect(send.mock.calls[0][0]).toMatchObject({ trigger: 'page_view', firstOfVisit: false });
    expect(send.mock.calls[1][0]).toMatchObject({ trigger: 'store_click', firstOfVisit: true });
  });

  it('keeps its own record, so clearing one path does not clear the other', () => {
    recordPageView();
    resetQualifiedActions();

    expect(recordPageView()).toBe(false);
  });
});
