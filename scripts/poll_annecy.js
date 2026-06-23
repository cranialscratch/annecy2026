const { chromium } = require('playwright');

const CONFIG = {
  email: process.env.ANNECY_EMAIL,
  password: process.env.ANNECY_PASSWORD,
  eventUrl: 'https://programme.annecyfestival.com/en/event/10317460-d3b5-4a16-99aa-c2e9f2e98847',
  pollIntervalMs: 30000,
};

if (!CONFIG.email || !CONFIG.password) {
  console.error('ANNECY_EMAIL and ANNECY_PASSWORD env vars are required');
  process.exit(1);
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
  // Logged in = redirected back to programme domain, not stuck on auth domain
  return url.includes('programme.annecyfestival.com') && !url.includes('account.annecyfestival.com');
}

async function login(page) {
  log('Navigating to homepage...');
  await page.goto('https://programme.annecyfestival.com/en', { waitUntil: 'networkidle', timeout: 30000 });

  // Click Account link → triggers OAuth redirect to account.annecyfestival.com
  const accountLink = await page.$('a:has-text("Account"), a[href*="account"]');
  if (!accountLink) throw new Error('Account link not found on homepage');
  const href = await accountLink.getAttribute('href').catch(() => '');
  log(`Clicking Account link (href=${href})`);
  await accountLink.click();

  // Wait for the OAuth login page on account.annecyfestival.com
  await page.waitForURL(/account\.annecyfestival\.com/, { timeout: 15000 });
  log(`OAuth page: ${page.url()}`);

  // Wait for the form fields (citia_username / citia_password)
  await page.waitForSelector('input[name="citia_username"], input[id="username"]', { timeout: 10000 });
  log('Login form ready');
  await screenshot(page, 'login_form');

  await page.fill('input[name="citia_username"], input[id="username"]', CONFIG.email);
  await page.fill('input[name="citia_password"], input[id="password"]', CONFIG.password);
  log('Credentials filled');

  await page.click('button[type="submit"]');
  log('Submitted — waiting for OAuth redirect back to programme.annecyfestival.com...');

  // The OAuth flow redirects back through several URLs — wait up to 45s
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
    // Check for error messages
    if (text.toLowerCase().includes('incorrect') || text.toLowerCase().includes('invalide') || text.toLowerCase().includes('error')) {
      throw new Error('Login failed — invalid credentials or account issue');
    }
    throw new Error(`OAuth redirect did not complete within 45s (stuck at ${url})`);
  }
}

async function checkAndBook(page) {
  log('Navigating to event page...');
  await page.goto(CONFIG.eventUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Verify still logged in
  if (!isLoggedIn(page.url())) {
    log('Session expired — re-login needed');
    throw new Error('session expired');
  }

  const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
  log(`Page preview: ${pageText.substring(0, 250).replace(/\n/g, ' ')}`);

  // Log all buttons/links with their text for debugging
  const elements = await page.$$eval('button, a', els =>
    els.map(e => ({ tag: e.tagName, text: e.innerText?.trim().substring(0, 60), disabled: e.disabled, class: e.className.substring(0, 50) }))
       .filter(e => e.text && e.text.length > 0)
  );
  log('Interactive elements: ' + JSON.stringify(elements.slice(0, 20)));

  const soldOutPhrases = ['sold out', 'complet', 'no availability', 'plus disponible', 'epuise', 'guichet fermé', 'no places', 'session complète'];
  for (const phrase of soldOutPhrases) {
    if (pageText.includes(phrase)) { log(`Unavailable — "${phrase}"`); return false; }
  }

  // Only match booking buttons with visible, meaningful text — no empty/class-only matches
  const bookingTextPatterns = [/book/i, /reserv/i, /réserv/i, /add to cart/i, /acheter/i, /billet/i, /ticket/i, /place/i];
  const allClickable = await page.$$('button:not([disabled]), a');

  for (const el of allClickable) {
    try {
      const text = (await el.innerText().catch(() => '')).trim();
      if (!text || text.length < 2) continue; // skip empty buttons
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

  log('No booking button with meaningful text found — slot not open yet');
  return false;
}

async function completeBooking(page) {
  log('Attempting to complete booking flow...');
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
  const finalUrl = page.url();
  log(`Final URL: ${finalUrl}`);
  log(`Final page text: ${finalText.substring(0, 200).replace(/\n/g, ' ')}`);

  const confirmed = ['confirmation', 'confirmed', 'success', 'réservation confirmée', 'reservation confirmee', 'thank you', 'merci', 'votre réservation'].some(p => finalText.includes(p));
  if (confirmed) {
    log('BOOKING CONFIRMED!');
    return true;
  }

  log('Booking flow done — confirmation phrase not found in page text');
  // Return true anyway so we stop polling — booking was attempted, user should verify manually
  return true;
}

(async () => {
  log('=== Annecy Festival Reservation Poller ===');
  log(`Target: ${CONFIG.eventUrl}`);
  log(`Poll interval: ${CONFIG.pollIntervalMs / 1000}s`);

  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  // Initial login
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
      log(`Error during poll: ${e.message}`);
      if (/(session|auth|login|connexion|401|403)/i.test(e.message)) {
        log('Re-logging in...');
        await login(page).catch(le => log(`Re-login error: ${le.message}`));
      }
    }

    log(`Waiting ${CONFIG.pollIntervalMs / 1000}s before next check...`);
    await new Promise(r => setTimeout(r, CONFIG.pollIntervalMs));
  }

  await browser.close();
  log('=== Poller finished ===');
})();
