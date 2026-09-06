import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppStoreLink } from './AppStoreLink';

describe('AppStoreLink campaign handoff', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('turns a valid Google campaign key into its Apple handoff path', () => {
    window.history.replaceState({}, '', '/?utm_campaign=gs_display_reed_a1');

    render(<AppStoreLink>Download</AppStoreLink>);

    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      '/app/gs_display_reed_a1',
    );
  });

  it('turns another valid campaign key into its matching Apple handoff path', () => {
    window.history.replaceState({}, '', '/?utm_campaign=gs_search_iris_a1');

    render(<AppStoreLink>Download</AppStoreLink>);

    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      '/app/gs_search_iris_a1',
    );
  });

  it('keeps an invalid campaign key on the normal App Store handoff', () => {
    window.history.replaceState({}, '', '/?utm_campaign=this_campaign_key_is_over_the_apple_limit');

    render(<AppStoreLink>Download</AppStoreLink>);

    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('href', '/app');
  });

  it('keeps the approved first-touch campaign after client navigation', () => {
    window.history.replaceState({}, '', '/?utm_campaign=gs_display_reed_a1');
    render(<AppStoreLink>First download</AppStoreLink>);
    window.history.replaceState({}, '', '/privacy-policy');

    render(<AppStoreLink>Second download</AppStoreLink>);

    expect(screen.getByRole('link', { name: 'Second download' })).toHaveAttribute(
      'href',
      '/app/gs_display_reed_a1',
    );
  });

  it('keeps prerendered markup on the normal handoff until the browser hydrates', () => {
    const markup = renderToStaticMarkup(<AppStoreLink>Download</AppStoreLink>);

    expect(markup).toContain('href="/app"');
  });
});
