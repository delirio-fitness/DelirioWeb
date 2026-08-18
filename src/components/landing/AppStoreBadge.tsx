import appStoreBadge from '../../images/appleOfficialBadges/Download_on_the_App_Store_Badge_US-UK_RGB_blk.svg';
import { AppStoreLink } from './AppStoreLink';

type AppStoreBadgeProps = {
  className?: string;
  label?: string;
  tabIndex?: number;
  'aria-hidden'?: boolean;
};

/**
 * Apple's unmodified App Store badge artwork, on the tracked store link.
 *
 * The SVG is sourced directly from Apple's developer marketing assets. Keep
 * visual interaction on the link container so the protected artwork itself is
 * never recolored, cropped, or distorted — a test pins its hash.
 */
export function AppStoreBadge({
  className = '',
  label = 'Download Delirio on the App Store',
  tabIndex,
  'aria-hidden': ariaHidden,
}: AppStoreBadgeProps) {
  return (
    <AppStoreLink
      aria-hidden={ariaHidden}
      className={`d3-app-store-badge ${className}`.trim()}
      label={label}
      tabIndex={tabIndex}
    >
      <img alt="" aria-hidden="true" src={appStoreBadge} />
    </AppStoreLink>
  );
}
