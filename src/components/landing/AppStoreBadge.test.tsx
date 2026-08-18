import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppStoreBadge } from './AppStoreBadge';
import { recordQualifiedAction } from '../../services/conversionEvents';

jest.mock('../../services/conversionEvents', () => ({ recordQualifiedAction: jest.fn() }));

describe('AppStoreBadge', () => {
  beforeEach(() => jest.mocked(recordQualifiedAction).mockClear());

  it('renders an accessible App Store destination', () => {
    render(<AppStoreBadge />);

    const link = screen.getByRole('link', { name: /download delirio on the app store/i });
    expect(link).toHaveAttribute('href', '/app');
    expect(link).toHaveAttribute('target', '_blank');
  });

  /**
   * The badge is a store link like any other, so it has to report like one —
   * this is the case the shared `AppStoreLink` exists to make unforgettable.
   */
  it('reports the click, because artwork converts as silently as a bare link', async () => {
    const user = userEvent.setup();
    render(<AppStoreBadge />);

    await user.click(screen.getByRole('link', { name: /download delirio on the app store/i }));
    expect(recordQualifiedAction).toHaveBeenCalledWith('store_click');
  });

  it('keeps Apple’s downloaded master artwork unchanged', () => {
    const badge = readFileSync(resolve(
      process.cwd(),
      'src/images/appleOfficialBadges/Download_on_the_App_Store_Badge_US-UK_RGB_blk.svg',
    ));

    expect(createHash('sha256').update(badge).digest('hex'))
      .toBe('a26fc5b38380272c92e9019a2eb8b45542a66814b3e2b203772db8904b9fb99f');
  });
});
