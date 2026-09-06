/**
 * Turns a Google Ads campaign key into an App Store Connect campaign token.
 *
 * The campaign key is supplied by Google Ads as `utm_campaign`; it is not a
 * website-maintained allowlist. App Store Connect still needs a campaign with
 * the same token created before the ad starts. Keeping keys to this compact
 * slug format is intentional: it is unambiguous in Google Ads, GA4, and Apple
 * reporting, and is safely inside Apple's 30-character token limit.
 */
const APP_STORE_CAMPAIGN_TOKEN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,29}$/;

/**
 * Returns a valid campaign token or leaves the visitor on the normal `/app`
 * handoff. Invalid input never becomes an Apple reporting dimension.
 */
export function appStoreCampaignToken(campaign: string | undefined): string | undefined {
  return campaign && APP_STORE_CAMPAIGN_TOKEN.test(campaign) ? campaign : undefined;
}
