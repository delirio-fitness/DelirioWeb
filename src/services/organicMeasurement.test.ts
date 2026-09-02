import { resolveAttribution } from '../utils/attribution';
import {
  classifyAcquisition,
  recordOrganicSearchStoreHandoff,
  resetOrganicSearchStoreHandoff,
  tagAcquisitionChannel,
} from './organicMeasurement';

jest.mock('../utils/attribution', () => ({ resolveAttribution: jest.fn() }));

const clarity = jest.fn();
const resolve = jest.mocked(resolveAttribution);

describe('organic measurement', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    clarity.mockClear();
    window.clarity = clarity;
  });

  it('keeps UTM and Meta-click visits out of the organic segment', () => {
    expect(classifyAcquisition({ source: 'instagram' })).toBe('paid_campaign');
    expect(classifyAcquisition({ fbclid: 'click-id' })).toBe('paid_campaign');
  });

  it('recognizes a search referrer without retaining its URL', () => {
    resolve.mockReturnValue({ referrer: 'https://www.google.com/search?q=delirio' });

    expect(tagAcquisitionChannel()).toBe('organic_search');
    expect(clarity).toHaveBeenCalledWith('set', 'acquisition_channel', 'organic_search');
    expect(clarity).toHaveBeenCalledWith('set', 'organic_search_engine', 'google');
  });

  it('records one App Store handoff for an organic-search visit only', () => {
    resolve.mockReturnValue({ referrer: 'https://www.bing.com/search?q=delirio' });

    expect(recordOrganicSearchStoreHandoff()).toBe(true);
    expect(recordOrganicSearchStoreHandoff()).toBe(false);
    expect(clarity).toHaveBeenCalledTimes(1);
    expect(clarity).toHaveBeenCalledWith('event', 'organic_search_app_store_handoff');
  });

  it('does not emit an organic event for direct traffic', () => {
    resolve.mockReturnValue({});

    expect(recordOrganicSearchStoreHandoff()).toBe(false);
    expect(clarity).not.toHaveBeenCalled();
  });

  afterEach(resetOrganicSearchStoreHandoff);
});
