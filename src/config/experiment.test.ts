import {
  DEFAULT_LANDING_VARIANT,
  isLandingVariant,
  publishLandingVariant,
  resolveLandingVariant,
} from './experiment';

describe('landing variant assignment', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    delete window.delirioLandingVariant;
    window.history.replaceState({}, '', '/');
  });

  it('defaults an untagged visit to the control cell', () => {
    expect(resolveLandingVariant()).toBe(DEFAULT_LANDING_VARIANT);
    expect(DEFAULT_LANDING_VARIANT).toBe('a');
  });

  it.each(['a', 'b', 'c'] as const)('assigns the cell named by ?v=%s', (variant) => {
    expect(resolveLandingVariant(`?v=${variant}`)).toBe(variant);
  });

  it('reads the cell from the live URL when no search is passed', () => {
    window.history.replaceState({}, '', '/?v=c');
    expect(resolveLandingVariant()).toBe('c');
  });

  it('keeps the assigned cell after navigating away from the tagged URL', () => {
    resolveLandingVariant('?v=b');
    expect(resolveLandingVariant('')).toBe('b');
  });

  it('lets a later tagged URL move the visitor to a new cell', () => {
    resolveLandingVariant('?v=b');
    expect(resolveLandingVariant('?v=c')).toBe('c');
    expect(resolveLandingVariant('')).toBe('c');
  });

  it.each(['?v=d', '?v=', '?variant=b', '?v=A'])('falls back to the control for %s', (search) => {
    expect(resolveLandingVariant(search)).toBe(DEFAULT_LANDING_VARIANT);
  });

  it('ignores a stored value that is no longer a known cell', () => {
    window.sessionStorage.setItem('delirio:landing-variant', 'z');
    expect(resolveLandingVariant('')).toBe(DEFAULT_LANDING_VARIANT);
  });

  it('survives a session store that refuses to answer', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });

    expect(resolveLandingVariant('?v=c')).toBe('c');
    expect(resolveLandingVariant('')).toBe(DEFAULT_LANDING_VARIANT);

    getItem.mockRestore();
    setItem.mockRestore();
  });

  it('publishes the cell for ad tracking to pick up', () => {
    publishLandingVariant('b');
    expect(window.delirioLandingVariant).toBe('b');
  });

  it('recognises only the three defined cells', () => {
    expect(['a', 'b', 'c'].every(isLandingVariant)).toBe(true);
    expect([undefined, null, '', 'd', 'A', 1].some(isLandingVariant)).toBe(false);
  });
});
