import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4174;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
];

const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  env: { ...process.env, CI: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
server.stdout.on('data', (chunk) => { serverOutput += chunk; });
server.stderr.on('data', (chunk) => { serverOutput += chunk; });

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Vite exited before layout tests started.\n${serverOutput}`);
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out waiting for Vite.\n${serverOutput}`);
}

async function box(page, selector) {
  const value = await page.locator(selector).boundingBox();
  assert.ok(value, `${selector} must render`);
  return value;
}

function verticalGap(first, second) {
  return second.y - (first.y + first.height);
}

function assertGap(actual, minimum, label, viewport) {
  assert.ok(actual >= minimum, `${viewport}: ${label} gap must be >= ${minimum}px; received ${actual.toFixed(2)}px`);
}

async function testViewport(browser, viewport) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${BASE_URL}/?hero=v1`, { waitUntil: 'networkidle' });

  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.ok(geometry.scrollWidth <= geometry.clientWidth + 1, `${viewport.name}: page must not overflow horizontally`);

  const hero = await box(page, '.d3-hero');
  const heroContent = await box(page, '.d3-hero-content');
  const heroCopy = await box(page, '.d3-hero-copy');
  const heroActions = await box(page, '.d3-hero-action-group');
  assert.ok(heroContent.y >= hero.y, `${viewport.name}: Hero content must stay below the Hero top`);
  assert.ok(heroContent.y + heroContent.height <= hero.y + hero.height, `${viewport.name}: Hero content must remain inside the Hero`);
  const heroActionGap = verticalGap(heroCopy, heroActions);
  const minimumHeroActionGap = viewport.name === 'mobile' ? 32 : 48;
  const maximumHeroActionGap = viewport.name === 'mobile' ? 80 : 96;
  assertGap(heroActionGap, minimumHeroActionGap, 'Hero editorial-to-action', viewport.name);
  assert.ok(heroActionGap <= maximumHeroActionGap, `${viewport.name}: Hero CTA must remain associated with its editorial copy; received ${heroActionGap.toFixed(2)}px`);

  const sessionIntro = await box(page, '#session .coach-trial__intro');
  const sessionPanel = await box(page, '#session .coach-trial__panel');
  assertGap(verticalGap(sessionIntro, sessionPanel), viewport.name === 'mobile' ? 32 : 40, 'Coach intro-to-panel', viewport.name);

  await page.getByRole('button', { name: /reed.*select coach/i }).click();
  await page.getByRole('button', { name: 'TEXT' }).click();
  const messageViewport = await box(page, '.coach-trial__message-viewport');
  const composer = await box(page, '.coach-trial__chat-form');
  assertGap(verticalGap(messageViewport, composer), 12, 'Message history-to-composer', viewport.name);
  assert.equal(Math.round(composer.height), 70, `${viewport.name}: composer height must remain stable`);
  const historyWidthRatio = messageViewport.width / composer.width;
  assert.ok(Math.abs(historyWidthRatio - .75) < .015, `${viewport.name}: message history width must be 75% of the composer; received ${(historyWidthRatio * 100).toFixed(1)}%`);
  const minimumHistoryHeight = viewport.name === 'desktop' ? 416 : viewport.name === 'tablet' ? 900 : 360;
  assert.ok(messageViewport.height >= minimumHistoryHeight, `${viewport.name}: message history height must reflect the 50% increase`);

  const memorySection = await box(page, '.d3-memory');
  const memoryIntro = await box(page, '.d3-memory-intro');
  const memoryGraphic = await box(page, '.d3-loop');
  const memoryClose = await box(page, '.d3-memory-close');
  assertGap(verticalGap(memoryIntro, memoryGraphic), viewport.name === 'mobile' ? 150 : 190, 'Trust intro-to-infographic', viewport.name);
  assertGap(verticalGap(memoryGraphic, memoryClose), 49, 'Trust infographic-to-close', viewport.name);
  assertGap(memoryIntro.y - memorySection.y, 48, 'Trust section top padding', viewport.name);
  assertGap((memorySection.y + memorySection.height) - (memoryClose.y + memoryClose.height), 48, 'Trust section bottom padding', viewport.name);
  assert.ok(memoryClose.y + memoryClose.height <= memorySection.y + memorySection.height, `${viewport.name}: Trust content must remain inside its section`);

  const typography = await page.evaluate(() => {
    const size = (selector) => Number.parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
    const fitSelectors = [
      '.d3-hero h1',
      '.d3-section-intro h2',
      '.coach-trial__intro h2',
      '.d3-memory-intro h2',
      '.d3-memory-intro>p:last-child',
      '.d3-footer-copy h2',
    ];
    const clipped = fitSelectors.filter((selector) => {
      const element = document.querySelector(selector);
      return element.scrollWidth > element.clientWidth + 1;
    });
    return {
      hero: size('.d3-hero h1'),
      heading: size('.d3-section-intro h2'),
      body: size('.d3-memory-intro>p:last-child'),
      clipped,
    };
  });
  assert.deepEqual(typography.clipped, [], `${viewport.name}: representative text must not clip horizontally`);

  await page.close();
  process.stdout.write(`✓ ${viewport.name} layout contracts\n`);
  return typography;
}

async function testHeroVariant(browser, viewport, variant) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${BASE_URL}/?hero=${variant}`, { waitUntil: 'networkidle' });
  const hero = await box(page, '.d3-hero');
  const content = await box(page, '.d3-hero-content');
  const action = await box(page, '.d3-hero-action');
  assert.ok(content.y >= hero.y && content.y + content.height <= hero.y + hero.height, `${viewport.name}/${variant}: hero content must remain inside the frame`);
  assert.ok(action.x >= hero.x && action.x + action.width <= hero.x + hero.width, `${viewport.name}/${variant}: CTA must remain horizontally visible`);
  if (variant === 'v3' && viewport.name === 'desktop') {
    const scoreboard = await box(page, '.d3-hero-scoreboard');
    assert.ok(scoreboard.y + scoreboard.height <= viewport.height, `${viewport.name}/${variant}: scoreboard must be visible before scrolling`);
  }
  await page.close();
  process.stdout.write(`✓ ${viewport.name} hero ${variant}\n`);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const typography = [];
  for (const viewport of viewports) typography.push(await testViewport(browser, viewport));
  for (const variant of ['v2.3', 'v3']) {
    await testHeroVariant(browser, viewports[0], variant);
    await testHeroVariant(browser, viewports[2], variant);
  }
  assert.ok(typography[0].hero > typography[1].hero && typography[1].hero > typography[2].hero, 'Hero type must scale across desktop, tablet, and mobile');
  assert.ok(typography[0].heading > typography[1].heading && typography[1].heading > typography[2].heading, 'Section headings must scale across desktop, tablet, and mobile');
  assert.ok(typography[0].body > typography[1].body && typography[1].body > typography[2].body, 'Body type must scale across desktop, tablet, and mobile');
  process.stdout.write('Layout UX tests passed.\n');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
