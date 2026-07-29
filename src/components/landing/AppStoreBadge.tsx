import { APP_STORE_URL } from '../../config/product';
import appStoreBadge from '../../images/appleOfficialBadges/Download_on_the_App_Store_Badge_US-UK_RGB_blk.svg';

type AppStoreBadgeProps = {
  className?: string;
  label?: string;
  tabIndex?: number;
  'aria-hidden'?: boolean;
};

/**
 * Accessible link around Apple's unmodified App Store badge artwork.
 *
 * The SVG is sourced directly from Apple's developer marketing assets. Keep
 * visual interaction on the link container so the protected artwork itself is
 * never recolored, cropped, or distorted.
 */
export function AppStoreBadge({
  className = '',
  label = 'Download Delirio on the App Store',
  tabIndex,
  'aria-hidden': ariaHidden,
}: AppStoreBadgeProps) {
  return (
    <a
      aria-hidden={ariaHidden}
      aria-label={label}
      className={`d3-app-store-badge ${className}`.trim()}
      href={APP_STORE_URL}
      rel="noopener noreferrer"
      tabIndex={tabIndex}
      target="_blank"
    >
      <img alt="" aria-hidden="true" src={appStoreBadge} />
    </a>
  );
}
