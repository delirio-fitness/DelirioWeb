import {
  DEFAULT_WAITLIST_ORDER,
  isWaitlistOrder,
  resolveWaitlistOrder,
} from './waitlistOrder';

describe('resolveWaitlistOrder', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  /**
   * Email-first is what ships, so it is what an ad lands on. Pinned because the
   * default decides which arm reports `email_submitted`: flipping it back to
   * questions-first would silently stop `CompleteRegistration` for all paid
   * traffic, and nothing about the page would look different.
   */
  it('puts the email first when nothing asks otherwise', () => {
    expect(resolveWaitlistOrder('')).toBe('email');
    expect(DEFAULT_WAITLIST_ORDER).toBe('email');
  });

  it('runs the retired questions-first arm on an explicit ?wo=questions', () => {
    expect(resolveWaitlistOrder('?wo=questions')).toBe('questions');
  });

  /**
   * A visitor who reads the privacy policy and comes back must not change arms
   * on the way — that would put one person's opening in one bucket and their
   * signup in the other, corrupting both counts rather than just losing one.
   */
  // Asserted with the non-default arm, so it is persistence being measured and
  // not `DEFAULT_WAITLIST_ORDER` answering by coincidence.
  it('holds the arm for the tab once assigned', () => {
    resolveWaitlistOrder('?wo=questions');

    expect(resolveWaitlistOrder('')).toBe('questions');
  });

  it('lets a later explicit parameter move the visitor, for design review', () => {
    resolveWaitlistOrder('?wo=questions');

    expect(resolveWaitlistOrder('?wo=email')).toBe('email');
  });

  it('ignores a value that is not an arm', () => {
    expect(resolveWaitlistOrder('?wo=sideways')).toBe('email');
    expect(isWaitlistOrder('sideways')).toBe(false);
  });

  it('survives unavailable session storage', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });

    expect(resolveWaitlistOrder('?wo=questions')).toBe('questions');
    expect(resolveWaitlistOrder('')).toBe('email');

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
