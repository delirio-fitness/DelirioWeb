import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4174;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 360, height: 800 },
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

  if (viewport.name !== 'mobile') {
    const painPoints = await page.locator('.d3-movements article').evaluateAll((cards) => cards.map((card) => {
      const cardBox = card.getBoundingClientRect();
      const headingBox = card.querySelector('h3')?.getBoundingClientRect();
      const solutionBox = card.querySelector('p')?.getBoundingClientRect();
      return {
        width: cardBox.width,
        headingLeft: headingBox?.left ?? -1,
        solutionLeft: solutionBox?.left ?? -1,
        solutionTop: solutionBox?.top ?? -1,
      };
    }));
    assert.equal(painPoints.length, 4, `${viewport.name}: the problem band must retain four pain points`);
    const cardWidths = painPoints.map(({ width }) => width);
    assert.ok(Math.max(...cardWidths) - Math.min(...cardWidths) <= 1, `${viewport.name}: pain points must use equal-width columns`);
    const solutionTops = painPoints.map(({ solutionTop }) => solutionTop);
    assert.ok(Math.max(...solutionTops) - Math.min(...solutionTops) <= 1, `${viewport.name}: every Delirio solution must begin on the same Y-axis`);
    assert.ok(painPoints.every(({ headingLeft, solutionLeft }) => Math.abs(headingLeft - solutionLeft) <= 1), `${viewport.name}: every pain-point heading and solution must share the same left edge`);
  }

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

  const journey = await box(page, '#how-it-works');
  const coachStudio = await box(page, '#session');
  const journeyToStudioGap = verticalGap(journey, coachStudio);
  assert.ok(journey.y < coachStudio.y, `${viewport.name}: product journey must render before the coach studio`);
  assert.ok(Math.abs(journeyToStudioGap) <= 1, `${viewport.name}: product journey must meet the coach studio without an unintended spacer; received ${journeyToStudioGap.toFixed(2)}px`);
  const transitionStyles = await page.evaluate(() => ({
    fadeBackground: getComputedStyle(document.querySelector('.d3-section-fade--dark-to-light')).backgroundImage,
  }));
  assert.match(transitionStyles.fadeBackground, /linear-gradient/, `${viewport.name}: problem-to-journey transition must retain its crossfade`);
  const journeyTheme = await page.evaluate(() => {
    const section = document.querySelector('#how-it-works');
    const background = document.querySelector('.d3-plan-live-background img');
    const sectionStyle = getComputedStyle(section);
    const backgroundStyle = getComputedStyle(background);
    const beforeStyle = getComputedStyle(section, '::before');
    const afterStyle = getComputedStyle(section, '::after');
    const rgb = sectionStyle.backgroundColor.match(/[\d.]+/g).map(Number);
    const luminance = ((rgb[0] * .2126) + (rgb[1] * .7152) + (rgb[2] * .0722)) / 255;
    return {
      theme: section.getAttribute('data-theme'),
      luminance,
      foreground: sectionStyle.color,
      topGradient: beforeStyle.backgroundImage,
      bottomGradient: afterStyle.backgroundImage,
      backgroundFilter: backgroundStyle.filter,
      backgroundOpacity: Number.parseFloat(backgroundStyle.opacity),
    };
  });
  assert.equal(journeyTheme.theme, 'light', `${viewport.name}: product journey must expose its light theme`);
  assert.ok(journeyTheme.luminance > .8, `${viewport.name}: product journey background must remain light`);
  assert.match(journeyTheme.foreground, /18, 19, 15/, `${viewport.name}: product journey foreground must remain dark`);
  assert.match(journeyTheme.topGradient, /linear-gradient/, `${viewport.name}: product journey must retain its top opacity gradient`);
  assert.match(journeyTheme.bottomGradient, /linear-gradient/, `${viewport.name}: product journey must retain its bottom opacity gradient`);
  assert.match(journeyTheme.backgroundFilter, /blur\(/, `${viewport.name}: product journey must retain its blurred background image`);
  assert.ok(journeyTheme.backgroundOpacity > .4, `${viewport.name}: product journey background image must remain visible`);

  const sessionIntro = await box(page, '#session .coach-trial__intro');
  const sessionPanel = await box(page, '#session .coach-trial__panel');
  assertGap(verticalGap(sessionIntro, sessionPanel), viewport.name === 'mobile' ? 32 : 40, 'Coach intro-to-panel', viewport.name);

  await page.getByRole('button', { name: /reed.*select coach/i }).click();
  const coachControls = await box(page, '.coach-trial__controls');
  const sessionPanelAfterSelection = await box(page, '#session .coach-trial__panel');
  assert.ok(coachControls.x >= sessionPanelAfterSelection.x - 1, `${viewport.name}: coach controls must remain inside the session panel`);
  assert.ok(coachControls.x + coachControls.width <= sessionPanelAfterSelection.x + sessionPanelAfterSelection.width + 1, `${viewport.name}: coach controls must not overflow the session panel`);
  const controlButtons = await page.locator('.coach-trial__controls button').evaluateAll((buttons) => buttons.map((button) => ({
    width: button.getBoundingClientRect().width,
    textFits: button.scrollWidth <= button.clientWidth + 1,
  })));
  assert.ok(controlButtons.every(({ width }) => width >= (viewport.name === 'mobile' ? 130 : 140)), `${viewport.name}: coach controls must retain a usable adaptive width`);
  assert.ok(controlButtons.every(({ textFits }) => textFits), `${viewport.name}: coach control labels must remain inside their buttons`);
  const selectedGeometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.ok(selectedGeometry.scrollWidth <= selectedGeometry.clientWidth + 1, `${viewport.name}: selected coach state must not overflow horizontally`);
  await page.getByRole('button', { name: 'TEXT', exact: true }).click();
  const messageViewport = await box(page, '.coach-trial__message-viewport');
  const composer = await box(page, '.coach-trial__chat-form');
  assertGap(verticalGap(messageViewport, composer), 12, 'Message history-to-composer', viewport.name);
  assert.equal(Math.round(composer.height), 70, `${viewport.name}: composer height must remain stable`);
  const historyWidthRatio = messageViewport.width / composer.width;
  assert.ok(Math.abs(historyWidthRatio - .75) < .015, `${viewport.name}: message history width must be 75% of the composer; received ${(historyWidthRatio * 100).toFixed(1)}%`);
  const minimumHistoryHeight = viewport.name === 'desktop' ? 416 : viewport.name === 'tablet' ? 900 : 360;
  assert.ok(messageViewport.height >= minimumHistoryHeight, `${viewport.name}: message history height must reflect the 50% increase`);

  const deviceFrames = await page.locator('.d3-iphone-frame').evaluateAll((frames) => frames.map((frame) => {
    const shell = frame.getBoundingClientRect();
    const screenElement = frame.querySelector('.d3-iphone-screen');
    const image = screenElement?.querySelector('img');
    const screen = screenElement?.getBoundingClientRect();
    const style = getComputedStyle(frame);
    return {
      device: frame.getAttribute('data-device'),
      matte: style.backgroundImage === 'none',
      screenContained: Boolean(screen)
        && screen.left >= shell.left
        && screen.right <= shell.right
        && screen.top >= shell.top
        && screen.bottom <= shell.bottom,
      screenWidthRatio: screen ? screen.width / shell.width : 0,
      imageLoaded: Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0),
    };
  }));
  assert.ok(deviceFrames.length >= 2, `${viewport.name}: all active product screenshots must use the shared phone frame`);
  assert.ok(deviceFrames.every((frame) => frame.device === 'iphone-15-pro-max'), `${viewport.name}: every product screenshot must use the selected iMock-style device`);
  assert.ok(deviceFrames.every((frame) => frame.matte), `${viewport.name}: the selected device shell must retain its matte finish`);
  assert.ok(deviceFrames.every((frame) => frame.screenContained), `${viewport.name}: every screenshot aperture must remain inside its device shell`);
  assert.ok(deviceFrames.every((frame) => frame.screenWidthRatio > .9), `${viewport.name}: screenshots must retain the intended wide screen aperture`);
  assert.ok(deviceFrames.every((frame) => frame.imageLoaded), `${viewport.name}: every framed screenshot must load at its native aspect ratio`);

  const faqType = await page.evaluate(() => {
    const id = getComputedStyle(document.querySelector('.d3-faq-list button span'));
    const title = getComputedStyle(document.querySelector('.d3-faq-list button b'));
    return {
      idSize: Number.parseFloat(id.fontSize),
      titleWeight: Number.parseInt(title.fontWeight, 10),
    };
  });
  assert.ok(faqType.idSize >= 16, `${viewport.name}: FAQ question IDs must remain legible`);
  assert.ok(faqType.titleWeight <= 600, `${viewport.name}: FAQ question titles must retain their softer weight`);

  const pricingColors = await page.evaluate(() => {
    const luminance = (selector) => {
      const values = getComputedStyle(document.querySelector(selector)).backgroundColor.match(/[\d.]+/g).map(Number);
      return ((values[0] * .2126) + (values[1] * .7152) + (values[2] * .0722)) / 255;
    };
    return {
      section: luminance('.d3-pricing-wrap'),
      monthly: luminance('.d3-plan-monthly'),
      annual: luminance('.d3-plan-annual'),
    };
  });
  assert.ok(pricingColors.section < .15, `${viewport.name}: pricing section must retain its dark theme`);
  assert.ok(pricingColors.monthly < .2, `${viewport.name}: monthly pricing card must remain dark`);
  assert.ok(pricingColors.annual < .25, `${viewport.name}: annual pricing card must remain dark`);
  if (viewport.name !== 'mobile') {
    const monthlyPlan = await box(page, '.d3-plan-monthly');
    const annualPlan = await box(page, '.d3-plan-annual');
    assert.ok(Math.abs(monthlyPlan.y - annualPlan.y) <= 1, `${viewport.name}: monthly and annual pricing card top borders must align`);
  }

  // The site's terminal action. Apple's badge is fixed-ratio artwork, so a
  // squeezed footer column shows up here as a distorted or clipped badge.
  const appCard = await box(page, '.d3-app-card');
  const storeBadge = await box(page, '.d3-footer-app-badge');
  assert.ok(storeBadge.x >= appCard.x - 1, `${viewport.name}: App Store badge must remain inside the footer card`);
  assert.ok(storeBadge.x + storeBadge.width <= appCard.x + appCard.width + 1, `${viewport.name}: App Store badge must not overflow the footer card`);
  assert.ok(storeBadge.height >= 44, `${viewport.name}: App Store badge must stay a 44px-plus tap target`);

  const typography = await page.evaluate(() => {
    const size = (selector) => Number.parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
    const fitSelectors = [
      '.d3-hero h1',
      '.d3-section-intro h2',
      '.coach-trial__intro h2',
      '.d3-pricing-intro h2',
      '.d3-pricing-intro>p',
    ];
    const clipped = fitSelectors.filter((selector) => {
      const element = document.querySelector(selector);
      return element.scrollWidth > element.clientWidth + 1;
    });
    const fontSelectors = [
      '.d3-nav a',
      '.d3-hero h1',
      '.d3-section-intro h2',
      '.coach-trial__body',
      '.d3-plan-live-body',
      '.d3-pricing-intro h2',
      '.d3-faq-list button b',
    ];
    const fontMismatches = fontSelectors.filter((selector) => !getComputedStyle(document.querySelector(selector)).fontFamily.includes('Exo 2'));
    return {
      hero: size('.d3-hero h1'),
      heading: size('.d3-section-intro h2'),
      body: size('.d3-pricing-intro>p'),
      clipped,
      fontMismatches,
    };
  });
  assert.deepEqual(typography.clipped, [], `${viewport.name}: representative text must not clip horizontally`);
  assert.deepEqual(typography.fontMismatches, [], `${viewport.name}: every landing-page text group must use Exo 2`);

  await page.close();
  process.stdout.write(`✓ ${viewport.name} layout contracts\n`);
  return typography;
}

async function testHeroVariant(browser, viewport, variant) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${BASE_URL}/?hero=${variant}`, { waitUntil: 'networkidle' });
  const hero = await box(page, '.d3-hero');
  const content = await box(page, '.d3-hero-content');
  const action = await box(page, variant === 'v3' ? '.d3-hero-questionnaire-action' : '.d3-hero-action');
  assert.ok(content.y >= hero.y && content.y + content.height <= hero.y + hero.height, `${viewport.name}/${variant}: hero content must remain inside the frame`);
  assert.ok(action.x >= hero.x && action.x + action.width <= hero.x + hero.width, `${viewport.name}/${variant}: CTA must remain horizontally visible`);
  if (variant === 'v3') {
    const signal = await box(page, '.d3-hero-coaching-signal');
    assert.ok(Math.abs(hero.height - viewport.height) <= 1, `${viewport.name}/${variant}: default hero must match the initial viewport height`);
    assert.ok(signal.y >= hero.y && signal.y + signal.height <= viewport.height, `${viewport.name}/${variant}: coaching signal must be visible before scrolling`);
    if (viewport.name === 'mobile') {
      const actions = await box(page, '.d3-hero-action-group');
      assertGap(verticalGap(actions, signal), 16, 'Hero actions-to-status signal', `${viewport.name}/${variant}`);
    }
    const heroFonts = await page.evaluate(() => [
      '.d3-hero .d3-kicker',
      '.d3-hero h1',
      '.d3-hero-typewriter',
      '.d3-hero-support',
      '.d3-hero-invitation',
      '.d3-hero-questionnaire-action',
      '.d3-hero-capabilities',
      '.d3-hero-coaching-signal small',
      '.d3-hero-coaching-signal strong',
    ].map((selector) => getComputedStyle(document.querySelector(selector)).fontFamily));
    assert.ok(heroFonts.every((fontFamily) => fontFamily.includes('Exo 2')), `${viewport.name}/${variant}: every hero text group must use Exo 2`);
    const headingColumns = await page.evaluate(() => {
      const lines = Array.from(document.querySelectorAll('.d3-hero-heading-line'));
      const leadText = lines.map((line) => line.querySelector('.d3-hero-heading-lead').textContent);
      const leadColor = getComputedStyle(lines[0].querySelector('.d3-hero-heading-lead')).color;
      return { leadText, leadColor };
    });
    assert.deepEqual(headingColumns.leadText, ['YOU'], `${viewport.name}/${variant}: only the animated action line should receive the pronoun treatment`);
    assert.equal(headingColumns.leadColor, 'rgb(255, 255, 255)', `${viewport.name}/${variant}: the action-line pronoun must match the static heading color`);
    const typewriterColor = await page.locator('.d3-hero-typewriter').evaluate((element) => getComputedStyle(element).color);
    assert.equal(typewriterColor, 'rgb(200, 216, 192)', `${viewport.name}/${variant}: the animated action word must use the accent color`);

    await page.getByRole('button', { name: /shape what.s next/i }).click();
    const questionnaire = await box(page, '.d3-questionnaire');
    const questionnaireProgress = await box(page, '.d3-questionnaire-progress');
    const expectedWidthRatio = viewport.name === 'mobile' ? 1 : .82;
    assert.ok(
      Math.abs((questionnaire.width / viewport.width) - expectedWidthRatio) < .02,
      `${viewport.name}/${variant}: questionnaire width must remain ${Math.round(expectedWidthRatio * 100)}% of the viewport`,
    );
    assert.ok(questionnaire.y >= 0 && questionnaire.y + questionnaire.height <= viewport.height + 1, `${viewport.name}/${variant}: questionnaire must remain inside the viewport`);
    assert.ok(Math.abs(questionnaireProgress.x - questionnaire.x) <= 1, `${viewport.name}/${variant}: questionnaire progress must begin at the container edge`);
    assert.ok(Math.abs(questionnaireProgress.width - questionnaire.width) <= 1, `${viewport.name}/${variant}: questionnaire progress must span the full container width`);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', `${viewport.name}/${variant}: questionnaire must lock page scrolling`);
    await page.waitForFunction(() => document.activeElement?.id === 'questionnaire-question');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'questionnaire-question', `${viewport.name}/${variant}: questionnaire must move focus to the current question`);
    await page.keyboard.press('Escape');
    await page.locator('.d3-questionnaire').waitFor({ state: 'detached' });
    assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden', `${viewport.name}/${variant}: closing the questionnaire must restore page scrolling`);
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
