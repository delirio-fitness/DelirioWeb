import { resolveAttribution } from './attribution';

/** Every envelope is stamped, so no assertion below can spell one out in full. */
const capturedAt = expect.any(Number) as unknown as number;

describe('resolveAttribution', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('captures campaign parameters from the landing URL', () => {
    const attribution = resolveAttribution('?utm_source=meta&utm_campaign=glp1_v3&fbclid=abc123', '');

    expect(attribution).toEqual({
      source: 'meta',
      campaign: 'glp1_v3',
      fbclid: 'abc123',
      capturedAt,
    });
  });

  it('holds first touch when a later call arrives with no parameters', () => {
    resolveAttribution('?utm_campaign=glp1_v3', '');

    // What an internal Link back to `/` looks like: the campaign must survive it.
    expect(resolveAttribution('', '')).toEqual({ campaign: 'glp1_v3', capturedAt });
  });

  it('does not let a later campaign overwrite the one that paid for the click', () => {
    resolveAttribution('?utm_campaign=first', '');

    expect(resolveAttribution('?utm_campaign=second', '')).toEqual({
      campaign: 'first',
      capturedAt,
    });
  });

  /**
   * The stamp stands in for the ad click time when the server builds Meta's
   * `fbc`, so it has to name the landing rather than the conversion — a visitor
   * who reads the page before signing up is minutes past their click.
   */
  it('stamps the first touch, not the call that reads it back', () => {
    const first = resolveAttribution('?fbclid=abc123', '');
    const reread = resolveAttribution('', '');

    expect(reread.capturedAt).toBe(first.capturedAt);
    expect(first.capturedAt).toBeLessThanOrEqual(Date.now());
  });

  it('records an external referrer but ignores our own domain', () => {
    expect(resolveAttribution('', 'https://www.instagram.com/')).toEqual({
      referrer: 'https://www.instagram.com/',
      capturedAt,
    });

    window.sessionStorage.clear();
    expect(resolveAttribution('', `https://${window.location.host}/privacy-policy`)).toEqual({
      capturedAt,
    });
  });

  it('drops blank values rather than storing empty strings', () => {
    expect(resolveAttribution('?utm_source=&utm_campaign=%20', '')).toEqual({ capturedAt });
  });

  it('truncates an oversized value so one junk URL cannot bloat every event', () => {
    const attribution = resolveAttribution(`?utm_campaign=${'x'.repeat(500)}`, '');

    expect(attribution.campaign).toHaveLength(200);
  });

  it('survives unavailable session storage', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });

    expect(resolveAttribution('?utm_campaign=glp1_v3', '')).toEqual({
      campaign: 'glp1_v3',
      capturedAt,
    });

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
