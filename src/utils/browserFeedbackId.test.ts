import { getBrowserFeedbackId } from './browserFeedbackId';

describe('getBrowserFeedbackId', () => {
  afterEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('persists and reuses one anonymous ID per browser', () => {
    const randomUUID = jest.spyOn(crypto, 'randomUUID').mockReturnValue('11111111-1111-4111-8111-111111111111');

    expect(getBrowserFeedbackId()).toBe('11111111-1111-4111-8111-111111111111');
    expect(getBrowserFeedbackId()).toBe('11111111-1111-4111-8111-111111111111');
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });
});
