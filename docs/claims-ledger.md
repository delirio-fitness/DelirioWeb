# Delirio marketing claims ledger

Internal review document. Claims remain public per current product direction, but must be revalidated when product behavior, legal terms, providers, or pricing change.

| Claim | Surface | Evidence status | Owner | Required follow-up |
| --- | --- | --- | --- | --- |
| Delirio watches form live and gives real-time corrections | Comparison, FAQ, How It Works | Terms and Privacy describe camera form feedback; accuracy and supported exercises are not enumerated | Product + ML | Document supported exercises, latency, and error bounds |
| Delirio is always responsive / available every day | Comparison and FAQ | Marketing assertion; no uptime or response-time commitment located | Product + Infrastructure | Define availability wording or publish an operational target |
| Delirio can replace a trainer for most people | FAQ | Marketing assertion; no Delirio outcome study located | Product + Legal | Substantiate audience and outcome scope or revise |
| Coach memory persists across sessions | FAQ and proof copy | Privacy describes stored conversation history, summaries, goals, and preferences | Product + Privacy | Document retention, deletion, and exact continuity behavior |
| SMS and WhatsApp share the same conversation | FAQ and Terms | Mentioned in Terms and Privacy; live web integration not verified here | Product + Messaging | Verify production channel availability and context continuity |
| Workout data, video, and conversations are private | FAQ | Privacy states data is not sold but is shared with service providers | Privacy + Legal | Keep contextual provider disclosure synchronized with policy |
| In-person and online coaching price ranges | Comparison | Existing marketing comparison; source and review date not located | Marketing | Add current market sources and review cadence |
| $30 monthly and $180 yearly subscriptions | Pricing, FAQ, Terms | Product-owner supplied pricing; App Store listing not yet configured | Product + Finance | Confirm App Store products and localized prices before launch |
| App Store purchase is available | All conversion actions | CTAs point at `/app`, an interstitial (`public/app.html`) that hands off to the live Delirio listing `id6756231078` | Release owner | Re-verify `/app` reaches the listing on the deployed site — not via `netlify dev` — after each deploy |

Last reviewed: July 12, 2026.
