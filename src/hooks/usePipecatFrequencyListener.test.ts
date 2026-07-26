import { mapFrequencyBins } from './usePipecatFrequencyListener';

describe('mapFrequencyBins', () => {
  it('returns exactly one normalized magnitude per requested bar', () => {
    expect(mapFrequencyBins(new Uint8Array([0, 255, 128, 64]), 2, 1)).toEqual([50, 38]);
  });

  it('applies the visual magnitude scalar and clamps at 100', () => {
    expect(mapFrequencyBins(new Uint8Array([128]), 1, 2)).toEqual([100]);
    expect(mapFrequencyBins(new Uint8Array([128]), 1, 0.5)).toEqual([25]);
  });

  it('produces silent bars when no frequency bins exist', () => {
    expect(mapFrequencyBins(new Uint8Array(), 3, 2)).toEqual([0, 0, 0]);
  });
});
