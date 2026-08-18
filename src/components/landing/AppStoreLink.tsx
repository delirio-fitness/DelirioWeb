import type { ReactNode } from 'react';
import { APP_STORE_URL } from '../../config/product';
import { recordQualifiedAction } from '../../services/conversionEvents';

/**
 * Every route to the App Store on this site, and the only one there should be.
 *
 * The destination and the conversion live together here on purpose. A download
 * CTA is the site's terminal action now that the waitlist is gone, so a bare
 * `<a href={APP_STORE_URL}>` added somewhere else would hand a visitor off to
 * Apple and report nothing — and a store link that converts silently looks
 * exactly like a store link nobody clicked. That failure is what deleted the
 * previous `useStoreClickTracking` rather than disabling it; routing every link
 * through one component is the version of it that cannot be forgotten.
 *
 * `recordQualifiedAction` is once-per-visit, so a visitor who clicks the hero
 * and then the footer is one `store_click`, not two.
 *
 * `APP_STORE_URL` is `/app`, the branded interstitial in `public/app.html` — not
 * the Apple URL, which lives only in that file. The interstitial paints, hands
 * off to the App Store, and sends the tab back to `/` if iOS intercepts the
 * navigation. `target="_blank"` so the landing page survives the handoff on
 * desktop, where no such interception happens.
 */
export function AppStoreLink({
  children,
  className = '',
  label,
  tabIndex,
  'aria-hidden': ariaHidden,
}: {
  children: ReactNode;
  className?: string;
  /** Accessible name, when the visible content is artwork rather than words. */
  label?: string;
  tabIndex?: number;
  'aria-hidden'?: boolean;
}) {
  return (
    <a
      aria-hidden={ariaHidden}
      aria-label={label}
      className={className || undefined}
      data-cta="store"
      href={APP_STORE_URL}
      onClick={() => recordQualifiedAction('store_click')}
      rel="noopener noreferrer"
      tabIndex={tabIndex}
      target="_blank"
    >
      {children}
    </a>
  );
}
