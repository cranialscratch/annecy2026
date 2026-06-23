const { chromium } = require('playwright');

const CONFIG = {
  email: process.env.ANNECY_EMAIL,
  password: process.env.ANNECY_PASSWORD,
  eventUrl: 'https://programme.annecyfestival.com/en/event/ba66e655-1e6d-40d1-9cb7-63cddc7790f7',
  minPollMs: 29000,
  maxPollMs: 121000,
};

if (!CONFIG.email || !CONFIG.password) {
  console.error('ANNECY_EMAIL and ANNECY_PASSWORD env vars are required');
  process.exit(1);
}

function randomPollMs() {
  return Math.floor(Math.random() * (CONFIG.maxPollMs - CONFIG.minPollMs + 1)) + CONFIG.minPollMs;
}

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function screenshot(page, name) {
  const file = `/tmp/${Date.now()}_${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  log(`Screenshot: ${name}`);
}

function isLoggedIn(url) {
  return url.includes('programme.annecyfestival.com') && !url.includes('account.annecyfestival.com');
}

async function login(page) {
  log('Navigating to homepage...');
  await page.goto('https://programme.annecyfestival.com/en', { waitUntil: 'networkidle', timeout: 30000 });

  const accountLink = await page.$('a:has-text("Account"), a[href*="account"]');
  if (!accountLink) throw new Error('Account link not found on homepage');
  const href = await accountLink.getAttribute('href').catch(() => '');
  log(`Clicking Account link (href=${href})`);
  await accountLink.click();

  await page.waitForURL(/account\.annecyfestival\.com/, { timeout: 15000 });
  log(`OAuth page: ${page.url()}`);

  await page.waitForSelector('input[name="citia_username"], input[id="username"]', { timeout: 10000 });
  log('Login form ready');
  await screenshot(page, 'login_form');

  await page.fill('input[name="citia_username"], input[id="username"]', CONFIG.email);
  await page.fill('input[name="citia_password"], input[id="password"]', CONFIG.password);
  log('Credentials filled');

  await page.click('button[type="submit"]');
  log('Submitted — waiting for OAuth redirect back to programme.annecyfestival.com...');

  try {
    await page.waitForURL(/programme\.annecyfestival\.com/, { timeout: 45000 });
    log(`Login SUCCESS — URL: ${page.url()}`);
    await screenshot(page, 'logged_in');
  } catch {
    await screenshot(page, 'login_redirect_timeout');
    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText).catch(() => '');
    log(`Login redirect timeout — current URL: ${url}`);
    log(`Page text: ${text.substring(0, 300)}`);
    if (/(incorrect|invalide|error|vérifiez)/i.test(text)) {
      throw new Error('Login failed — invalid credentials');
    }
    throw new Error(`OAuth redirect did not complete within 45s (stuck at ${url})`);
  }
}

async function checkAndBook(page) {
  log('Navigating to event page...');
  await page.goto(CONFIG.eventUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  if (!isLoggedIn(page.url())) {
    log('Session expired — re-login needed');
    throw new Error('session expired');
  }

  const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
  log(`Page preview: ${pageText.substring(0, 250).replace(/\n/g, ' ')}`);

  const elements = await page.$$eval('button, a', els =>
    els.map(e => ({ tag: e.tagName, text: e.innerText?.trim().substring(0, 60), disabled: e.disabled, class: e.className.substring(0, 50) }))
       .filter(e => e.text && e.text.length > 0)
  );
  log('Interactive elements: ' + JSON.stringify(elements.slice(0, 20)));

  const soldOutPhrases = ['sold out', 'complet', 'no availability', 'plus disponible', 'epuise', 'guichet fermé', 'no places', 'session complète'];
  for (const phrase of soldOutPhrases) {
    if (pageText.includes(phrase)) { log(`Unavailable — "${phrase}"`); return false; }
  }

  const bookingTextPatterns = [/book/i, /reserv/i, /réserv/i, /add to cart/i, /acheter/i, /billet/i, /ticket/i, /place/i];
  const allClickable = await page.$$('button:not([disabled]), a');

  for (const el of allClickable) {
    try {
      const text = (await el.innerText().catch(() => '')).trim();
      if (!text || text.length < 2) continue;
      if (!bookingTextPatterns.some(p => p.test(text))) continue;
      if (!await el.isVisible()) continue;
      if (!await el.isEnabled()) continue;

      log(`BOOKING BUTTON FOUND: "${text}" — clicking!`);
      await screenshot(page, 'slot_available');
      await el.click();
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      log(`Post-click URL: ${page.url()}`);
      await screenshot(page, 'after_booking_click');
      return await completeBooking(page);
    } catch {}
  }

  log('No booking button found — slot not open yet');
  return false;
}

async function completeBooking(page) {
  log('Completing booking flow...');
  const confirmTexts = [/confirm/i, /continue/i, /continuer/i, /suivant/i, /next/i, /proceed/i, /valider/i, /validate/i];

  for (let step = 1; step <= 8; step++) {
    await page.waitForTimeout(1000);
    let clicked = false;
    const buttons = await page.$$('button:not([disabled]), input[type="submit"]');
    for (const btn of buttons) {
      try {
        const text = (await btn.innerText().catch(() => '')).trim();
        if (!text) continue;
        if (!confirmTexts.some(p => p.test(text))) continue;
        if (!await btn.isVisible() || !await btn.isEnabled()) continue;
        log(`Step ${step}: clicking "${text}"`);
        await btn.click();
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        await screenshot(page, `booking_step${step}`);
        clicked = true;
        break;
      } catch {}
    }
    if (!clicked) break;
  }

  const finalText = await page.evaluate(() => document.body.innerText.toLowerCase());
  log(`Final URL: ${page.url()}`);
  log(`Final page: ${finalText.substring(0, 200).replace(/\n/g, ' ')}`);

  const confirmed = ['confirmation', 'confirmed', 'success', 'réservation confirmée', 'reservation confirmee', 'thank you', 'merci', 'votre réservation'].some(p => finalText.includes(p));
  log(confirmed ? 'BOOKING CONFIRMED!' : 'Booking flow done — verify manually');
  return true;
}

(async () => {
  log('=== Annecy Festival Reservation Poller ===');
  log(`Target: ${CONFIG.eventUrl}`);
  log(`Poll interval: ${CONFIG.minPollMs / 1000}–${CONFIG.maxPollMs / 1000}s (random)`);

  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  await login(page);

  let booked = false;
  while (!booked) {
    try {
      booked = await checkAndBook(page);
      if (booked) {
        log('Booking attempted — check your email and the festival site to confirm.');
        break;
      }
    } catch (e) {
      log(`Poll error: ${e.message}`);
      if (/(session|auth|login|connexion|401|403)/i.test(e.message)) {
        log('Re-logging in...');
        await login(page).catch(le => log(`Re-login error: ${le.message}`));
      }
    }

    const wait = randomPollMs();
    log(`Next check in ${(wait / 1000).toFixed(1)}s...`);
    await new Promise(r => setTimeout(r, wait));
  }

  await browser.close();
  log('=== Poller finished ===');
})();
