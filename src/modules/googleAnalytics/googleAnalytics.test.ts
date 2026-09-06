import {
  initGoogleAnalytics,
  recordAppStoreHandoff,
  resetAppStoreHandoff,
  resetGoogleAnalyticsInitialization,
} from './googleAnalytics';

describe('Google Analytics App Store handoff', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    document.head.querySelectorAll('script[data-delirio-ga4]').forEach((script) => script.remove());
    delete window.dataLayer;
    delete window.gtag;
    resetGoogleAnalyticsInitialization();
  });

  afterEach(resetAppStoreHandoff);

  it('loads the configured Google tag without Google Signals or ad personalization', () => {
    expect(initGoogleAnalytics('G-TESTMEASUREMENT')).toBe(true);

    expect(document.head.querySelector('script[data-delirio-ga4]')).toHaveAttribute(
      'src',
      expect.stringContaining('G-TESTMEASUREMENT'),
    );
    expect(window.dataLayer).toEqual(
      expect.arrayContaining([expect.arrayContaining(['config', 'G-TESTMEASUREMENT'])]),
    );
    expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({
            allow_ad_personalization_signals: false,
            allow_google_signals: false,
          }),
        ]),
      ]),
    );
  });

  it('records one privacy-safe App Store handoff with first-touch campaign context', () => {
    initGoogleAnalytics('G-TESTMEASUREMENT');

    expect(
      recordAppStoreHandoff({
        source: 'google',
        medium: 'cpc',
        campaign: 'gs_display_reed_a1',
      }),
    ).toBe(true);
    expect(recordAppStoreHandoff({ campaign: 'gs_display_reed_a1' })).toBe(false);
    expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          'event',
          'app_store_handoff',
          expect.objectContaining({
            acquisition_source: 'google',
            acquisition_medium: 'cpc',
            campaign_key: 'gs_display_reed_a1',
          }),
        ]),
      ]),
    );
  });
});
