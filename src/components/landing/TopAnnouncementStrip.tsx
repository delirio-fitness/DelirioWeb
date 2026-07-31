import { ArrowUpRight } from 'lucide-react';
import { APP_STORE_URL } from '../../config/product';

type TopAnnouncementStripProps = {
  visible: boolean;
};

/**
 * A lightweight App Store invitation shown only while the landing page is at
 * its starting position.
 */
export function TopAnnouncementStrip({ visible }: TopAnnouncementStripProps) {
  return (
    <aside
      aria-hidden={!visible}
      aria-label="Download Delirio"
      className={`d3-top-announcement ${visible ? 'is-visible' : 'is-hidden'}`}
    >
      <div>
        <strong>DELIRIO FOR IPHONE</strong>
        <span>AVAILABLE ON THE APP STORE</span>
        <a
          aria-label="Download Delirio on the App Store"
          href={APP_STORE_URL}
          rel="noopener noreferrer"
          tabIndex={visible ? undefined : -1}
          target="_blank"
        >
          DOWNLOAD <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}
