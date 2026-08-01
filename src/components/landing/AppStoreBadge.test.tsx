import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { AppStoreBadge } from './AppStoreBadge';

describe('AppStoreBadge', () => {
  it('renders an accessible App Store destination', () => {
    render(<AppStoreBadge />);

    const link = screen.getByRole('link', { name: /download delirio on the app store/i });
    expect(link).toHaveAttribute('href', 'https://apps.apple.com/us/app/delirio-ai-personal-trainer/id6756231078');
    expect(link).toHaveAttribute('target', '_blank');
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
