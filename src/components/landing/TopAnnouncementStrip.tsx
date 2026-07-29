import { ArrowUpRight } from 'lucide-react';

type TopAnnouncementStripProps = {
  visible: boolean;
};

/**
 * A lightweight wishlist invitation shown only while the landing page is at
 * its starting position.
 */
export function TopAnnouncementStrip({ visible }: TopAnnouncementStripProps) {
  return (
    <aside
      aria-hidden={!visible}
      aria-label="Delirio wishlist invitation"
      className={`d3-top-announcement ${visible ? 'is-visible' : 'is-hidden'}`}
    >
      <div>
        <strong>DELIRIO EARLY ACCESS</strong>
        <span>JOIN THE WISHLIST</span>
        <a
          aria-label="Join the Delirio wishlist"
          href="#wishlist"
          tabIndex={visible ? undefined : -1}
        >
          SIGN UP <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}
