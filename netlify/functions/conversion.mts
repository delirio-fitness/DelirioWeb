/**
 * The only thing on this site that talks to Meta.
 *
 * There is no Meta pixel in the browser. `fbevents.js` is a closed-source
 * third-party script with full DOM access: it reports the page URL and title on
 * every event, scrapes form fields when Automatic Advanced Matching is enabled
 * in Events Manager, and collects the text of what visitors click. None of that
 * is configurable from here and Meta can change it server-side without us
 * deploying anything, so a script we cannot audit is not allowed in the page.
 *
 * This function is the replacement. It receives a trigger slug from the browser,
 * looks up everything else in the table below, and posts a Conversions API event
 * built entirely on this side. Meta learns that a conversion happened on a given
 * ad click. It learns nothing else about the site or the visitor.
 *
 * Deliberately absent from every payload: email, name, phone, external ID, page
 * path, page title, referrer. `user_data` carries IP, user-agent, and `fbc` —
 * the ad click ID. Nothing else. Do not add identifiers here without re-reading
 * the privacy policy first; the "Advertising, Attribution, and Tracking" section
 * makes promises about exactly this payload, and a published policy that is
 * false in a checkable way is the FTC Section 5 hook the GoodRx and BetterHelp
 * orders turned on.
 *
 * ## There is no hashed email here any more, and adding one back is a decision
 *
 * A `store_click` carries no address, because the site no longer asks anyone for
 * one — the waitlist that did was scrapped when the app returned to the App
 * Store. The `em` field, its `acceptsEmail` gate, and the SHA-256 helper were
 * deleted with it rather than left inert. Recoverable from git if an email is
 * ever collected here again, but note what came with it: Meta's normalisation is
 * trim-and-lowercase and nothing else, the endpoint below is public so a `curl`
 * could post any address it liked, and the privacy policy had to name the
 * practice in three separate places to stay true.
 */

const GRAPH_API_VERSION = 'v21.0';

/**
 * What a trigger is worth, and what it is called.
 *
 * This table lives on the server and not in the bundle so the browser cannot
 * name its own conversions: the endpoint is public, so an unknown trigger has to
 * be droppable without reference to anything the caller said about it. It also
 * keeps ad configuration out of the client entirely, which is the property that
 * makes the "nothing on the page knows about Meta" claim true rather than
 * aspirational.
 *
 * `value` is relative intent, not revenue — do not compute ROAS from it.
 *
 * ## `store_click` is where this site's funnel ends
 *
 * The site explains the product and hands off to the App Store, so the download
 * click is the deepest thing it can observe. Everything past it — the install,
 * the trial, the subscription — is reported by the Meta SDK inside the iOS app,
 * against the same dataset. Do not try to reconstruct any of that from here.
 *
 * `standard` is the name an ad set can optimize on: Meta has cross-advertiser
 * priors for `Lead` and none for `DelirioStoreClick`, which exists to make
 * Events Manager readable and is a weak optimization target. `Lead` rather than
 * something install-shaped because that is what this event honestly is — an
 * intent signal from a web page, not a confirmed install. Point install
 * campaigns at the app's own events.
 *
 * `requiresFirstOfVisit` keeps `Lead` counting qualified *visitors* rather than
 * actions: it rides only on the visit's first qualifying action. With one
 * trigger in the table that is always true, so it is currently a no-op — kept
 * because it is what makes adding a second trigger safe rather than something
 * that quietly doubles the `Lead` count.
 *
 * ## `page_view` is input, not a target
 *
 * `store_click` is something an ad set can be pointed at. `PageView` is not —
 * every visitor does it, so optimizing toward it buys traffic and nothing else.
 * It is here as *model input*: without it Meta sees only the few percent of
 * visitors who click through to the store and has no idea the rest existed,
 * which is most of what it needs to predict who is worth showing the ad to. It
 * is also the one signal that survives Meta's health-and-wellness restrictions,
 * which cut mid- and lower-funnel events and leave upper-funnel ones alone.
 *
 * Two things make it the odd one out, and both are deliberate:
 *
 * - **No `Delirio*` twin.** The custom names exist to make Events Manager
 *   readable where a standard name is ambiguous. `PageView` is not ambiguous, and
 *   this is by far the highest-volume trigger — a twin would double the noisiest
 *   event in the dataset to restate its own name.
 * - **No `value`.** `value` is an intent score and a page load carries none.
 *   Giving it one would corrupt the only number in the payload that means
 *   anything.
 */
const TRIGGERS = {
  store_click: {
    custom: 'DelirioStoreClick',
    standard: 'Lead',
    requiresFirstOfVisit: true,
    value: 4,
  },
  page_view: {
    custom: null,
    standard: 'PageView',
    requiresFirstOfVisit: false,
    value: null,
  },
} as const;

type Trigger = keyof typeof TRIGGERS;

/** Campaign parameters we set ourselves. Anything not listed here is dropped. */
const ATTRIBUTION_FIELDS = ['source', 'medium', 'campaign', 'content', 'term'] as const;

const MAX_BODY_BYTES = 2048;
const MAX_FIELD_LENGTH = 200;

type IncomingEvent = {
  trigger?: unknown;
  eventId?: unknown;
  variant?: unknown;
  firstOfVisit?: unknown;
  fbclid?: unknown;
  fbclidAt?: unknown;
  attribution?: unknown;
};

function isTrigger(value: unknown): value is Trigger {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TRIGGERS, value);
}

function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, MAX_FIELD_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Builds Meta's click-ID cookie value without a cookie.
 *
 * `fb.<subdomainIndex>.<clickTime>.<fbclid>`; index 1 is an apex domain. The
 * browser captured `fbclid` and its arrival time on the landing URL, so the
 * click time is real rather than "whenever the conversion happened" — which
 * matters, because Meta matches on it.
 */
function buildFbc(fbclid: string, fbclidAt: unknown): string {
  const clickedAt = typeof fbclidAt === 'number' && Number.isFinite(fbclidAt) && fbclidAt > 0
    ? Math.floor(fbclidAt)
    : Date.now();
  return `fb.1.${clickedAt}.${fbclid}`;
}

/** The visitor's IP, as Netlify presents it. Meta needs it to match at all. */
function clientIp(request: Request): string | undefined {
  const forwarded = request.headers.get('x-nf-client-connection-ip')
    ?? request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || undefined;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { allow: 'POST' } });
  }

  const datasetId = process.env.META_DATASET_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  // Unconfigured is a valid state, not an error: deploy previews and any branch
  // without the secrets should accept the call and report nothing, exactly as
  // the browser did when `VITE_META_PIXEL_ID` was unset.
  if (!datasetId || !accessToken) {
    return Response.json({ reported: false, reason: 'unconfigured' });
  }

  // The endpoint is public and writes to a live dataset, so anything that does
  // not look like our own page calling it is refused. A *missing* `Origin` is
  // refused too, not waved through: browsers set it on every POST, so its
  // absence means the caller is not a page, and accepting it made forging a
  // conversion a one-line curl with no header at all.
  //
  // This does not stop someone who sets the header by hand, and it is not meant
  // to — the trigger table above is the allowlist that bounds what a forged
  // call can even claim. It removes the free case.
  //
  // Logged rather than refused quietly. If a browser ever stops sending the
  // header, or the site's primary domain drifts from `URL`, every conversion
  // starts 403ing and this line is the only thing that would say so.
  const siteUrl = process.env.URL ?? process.env.DEPLOY_URL;
  const origin = request.headers.get('origin');
  if (siteUrl && origin !== new URL(siteUrl).origin) {
    console.warn('[delirio-ads] refused a conversion from origin', origin ?? '(none sent)');
    return new Response(null, { status: 403 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });

  let body: IncomingEvent;
  try {
    body = JSON.parse(raw) as IncomingEvent;
  } catch {
    return new Response(null, { status: 400 });
  }

  const { trigger } = body;
  if (!isTrigger(trigger)) return new Response(null, { status: 400 });

  const eventId = cleanString(body.eventId);
  if (!eventId) return new Response(null, { status: 400 });

  const { custom, standard, requiresFirstOfVisit, value } = TRIGGERS[trigger];
  const variant = cleanString(body.variant);

  const userData: Record<string, string> = {};
  const ip = clientIp(request);
  const userAgent = request.headers.get('user-agent');
  if (ip) userData.client_ip_address = ip;
  if (userAgent) userData.client_user_agent = userAgent.slice(0, 512);
  const fbclid = cleanString(body.fbclid);
  if (fbclid) userData.fbc = buildFbc(fbclid, body.fbclidAt);

  const customData: Record<string, string | number> = { content_name: trigger };
  // A trigger with no intent score sends neither it nor a currency — see the
  // trigger table on why `page_view` has none.
  if (value !== null) {
    customData.value = value;
    customData.currency = 'USD';
  }
  if (variant) customData.content_category = `landing_${variant}`;

  const attribution = body.attribution;
  if (attribution && typeof attribution === 'object') {
    for (const field of ATTRIBUTION_FIELDS) {
      const parsed = cleanString((attribution as Record<string, unknown>)[field]);
      if (parsed) customData[`delirio_${field}`] = parsed;
    }
  }

  const eventTime = Math.floor(Date.now() / 1000);
  // The origin only. Meta uses this for reporting context and it is the same
  // string for every visitor — never the path, the query, or the title, so
  // nothing here distinguishes one visitor's browsing from another's.
  const eventSourceUrl = siteUrl ? new URL(siteUrl).origin : undefined;

  const base = {
    event_time: eventTime,
    event_id: eventId,
    action_source: 'website' as const,
    ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
    user_data: userData,
    custom_data: customData,
  };

  // The standard name is the optimizable one — Meta has cross-advertiser priors
  // for it and none for a name we invented — and whether it rides along depends
  // on the trigger. The `Delirio*` name beside it is what makes Events Manager
  // readable; `page_view` has none, for the reason in the table above.
  const data: (typeof base & { event_name: string })[] = [];
  if (!requiresFirstOfVisit || body.firstOfVisit === true) {
    data.push({ ...base, event_name: standard });
  }
  if (custom) data.push({ ...base, event_name: custom });

  // No trigger in the table can empty this — every one either has a custom name
  // or sends its standard unconditionally. Guarded anyway because an empty
  // `data` is rejected by Meta as a malformed batch, and adding a trigger with
  // both a guard and no twin is the one edit that would produce it.
  if (data.length === 0) return Response.json({ reported: false, reason: 'nothing-to-send' });

  const payload = { data };

  // Routes this event to the Test Events panel in Events Manager, which is the
  // only way to watch one arrive: the panel shows nothing for events that do
  // not carry a code, so without this there is no way to confirm the wiring
  // short of waiting for the dataset totals to move.
  //
  // **Unset in production, always.** Meta excludes test events from attribution
  // and optimization, so a code left in place reports nothing while this
  // function still answers `reported: true` on every call — invisible from the
  // browser, from this return value, and from anything short of the dataset
  // sitting at zero. The `test: true` below exists so the response says which
  // mode it ran in rather than making that guessable only from the env.
  //
  // It is a routing hint and carries no visitor data, so it does not touch the
  // payload rules in the header.
  const testEventCode = process.env.META_TEST_EVENT_CODE?.trim();
  if (testEventCode) {
    console.warn(
      '[delirio-ads] META_TEST_EVENT_CODE is set — events route to Test Events and do NOT count as conversions',
    );
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${datasetId}/events`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          ...(testEventCode ? { test_event_code: testEventCode } : {}),
          access_token: accessToken,
        }),
      },
    );

    if (!response.ok) {
      // Meta's error body names the offending field, and without it a rejected
      // event is invisible: the browser cannot see this response and would not
      // act on it anyway.
      console.error('[delirio-ads] Meta rejected the event', response.status, await response.text());
      return Response.json({ reported: false, reason: 'rejected' }, { status: 502 });
    }
  } catch (error) {
    console.error('[delirio-ads] could not reach Meta', error);
    return Response.json({ reported: false, reason: 'unreachable' }, { status: 502 });
  }

  return Response.json(testEventCode ? { reported: true, test: true } : { reported: true });
}
