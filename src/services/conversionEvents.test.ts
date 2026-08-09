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
    expect(recordQualifiedAction('email_submitted')).toBe(true);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: 'email_submitted', variant: DEFAULT_LANDING_VARIANT }),
    );
  });

  it('flags only the first action of a visit, so Lead counts visitors', () => {
    recordQualifiedAction('waitlist_started');
    recordQualifiedAction('email_submitted');

    expect(send.mock.calls[0][0].firstOfVisit).toBe(true);
    expect(send.mock.calls[1][0].firstOfVisit).toBe(false);
  });

  it('ignores a repeat of the same trigger', () => {
    expect(recordQualifiedAction('email_submitted')).toBe(true);
    expect(recordQualifiedAction('email_submitted')).toBe(false);

    expect(send).toHaveBeenCalledTimes(1);
  });

  it('gives each action its own event ID', () => {
    recordQualifiedAction('waitlist_started');
    recordQualifiedAction('email_submitted');

    expect(send.mock.calls[0][0].eventId).not.toBe(send.mock.calls[1][0].eventId);
    expect(send.mock.calls[0][0].eventId).toEqual(expect.any(String));
  });

  it('attaches the campaign that paid for the click', () => {
    window.sessionStorage.setItem(
      'delirio:attribution',
      JSON.stringify({ campaign: 'glp1_v3', source: 'meta' }),
    );

    recordQualifiedAction('email_submitted');

    expect(send.mock.calls[0][0].attribution).toMatchObject({
      campaign: 'glp1_v3',
      source: 'meta',
    });
  });

  /**
   * Any event that can only fire once the waitlist questions have been answered
   * reports health by correlation, whatever it is named and however tame the
   * questions currently look — so the trigger union is the guard, and these are
   * the names that must never come back into it.
   */
  it('accepts no trigger that fires downstream of the health questions', () => {
    // @ts-expect-error answering all six questions is not a reportable action.
    expect(() => recordQualifiedAction('quiz_completed')).not.toThrow();
    // @ts-expect-error the email box inside the gate is unlocked by those answers.
    expect(() => recordQualifiedAction('questionnaire_email_submitted')).not.toThrow();
  });

  it('no longer accepts the retired website coaching demos as triggers', () => {
    // @ts-expect-error the voice demo was removed with the coaching feature.
    expect(() => recordQualifiedAction('voice_demo_started')).not.toThrow();
    // @ts-expect-error the text demo was removed with the coaching feature.
    expect(() => recordQualifiedAction('text_demo_engaged')).not.toThrow();
  });

  it('no longer accepts the store click, now that nothing links to the App Store', () => {
    // @ts-expect-error every download CTA was replaced by the waitlist.
    expect(() => recordQualifiedAction('store_click')).not.toThrow();
  });

  /**
   * A page load is not a qualified action, so the trigger union must keep
   * refusing it — the separate `recordPageView` below is the only way in.
   */
  it('does not accept the page view, which costs the visitor nothing', () => {
    // @ts-expect-error arriving on the page is model input, not a conversion.
    expect(() => recordQualifiedAction('page_view')).not.toThrow();
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
   * qualified action, `waitlist_started` would arrive flagged `false` and `Lead`
   * would stop being reported entirely — visibly only as a number that never
   * moves in Events Manager, which is the kind of failure nobody catches.
   */
  it('never consumes the visit\'s first qualified action, so Lead still fires', () => {
    recordPageView();
    recordQualifiedAction('waitlist_started');

    expect(send.mock.calls[0][0]).toMatchObject({ trigger: 'page_view', firstOfVisit: false });
    expect(send.mock.calls[1][0]).toMatchObject({ trigger: 'waitlist_started', firstOfVisit: true });
  });

  it('keeps its own record, so clearing one path does not clear the other', () => {
    recordPageView();
    resetQualifiedActions();

    expect(recordPageView()).toBe(false);
  });
});
