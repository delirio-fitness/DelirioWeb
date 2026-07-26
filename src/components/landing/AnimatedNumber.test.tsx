import { easeOutExpo } from './AnimatedNumber';

describe('easeOutExpo', () => {
  it('starts at zero, rises quickly, and lands exactly on one', () => {
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(0.25)).toBe(0.5);
    expect(easeOutExpo(0.75)).toBeLessThan(1);
    expect(easeOutExpo(1)).toBe(1);
  });
});
