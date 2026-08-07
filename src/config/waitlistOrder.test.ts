import {
  DEFAULT_WAITLIST_ORDER,
  isWaitlistOrder,
  resolveWaitlistOrder,
} from './waitlistOrder';

describe('resolveWaitlistOrder', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('runs the questions-first control when nothing asks otherwise', () => {
    expect(resolveWaitlistOrder('')).toBe('questions');
    expect(DEFAULT_WAITLIST_ORDER).toBe('questions');
  });

  it('puts the email first on an explicit ?wo=email', () => {
    expect(resolveWaitlistOrder('?wo=email')).toBe('email');
  });

  /**
   * A visitor who reads the privacy policy and comes back must not change arms
   * on the way — that would put one person's opening in one bucket and their
   * signup in the other, corrupting both counts rather than just losing one.
   */
  it('holds the arm for the tab once assigned', () => {
    resolveWaitlistOrder('?wo=email');

    expect(resolveWaitlistOrder('')).toBe('email');
  });

  it('lets a later explicit parameter move the visitor, for design review', () => {
    resolveWaitlistOrder('?wo=email');

    expect(resolveWaitlistOrder('?wo=questions')).toBe('questions');
  });

  it('ignores a value that is not an arm', () => {
    expect(resolveWaitlistOrder('?wo=sideways')).toBe('questions');
    expect(isWaitlistOrder('sideways')).toBe(false);
  });

  it('survives unavailable session storage', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });

    expect(resolveWaitlistOrder('?wo=email')).toBe('email');
    expect(resolveWaitlistOrder('')).toBe('questions');

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
