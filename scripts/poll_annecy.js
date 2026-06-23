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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function jitter(base, spread) {
  return base + Math.floor(Math.random() * spread);
}

// Apply patches to hide automation signals before each page load
async function applyStealthPatches(page) {
  await page.addInitScript(() => {
    // Remove webdriver flag
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

    // Fake Chrome runtime object
    window.chrome = {
      runtime: {
        onConnect: { addListener: () => {} },
        onMessage: { addListener: () => {} },
        connect: () => ({}),
        sendMessage: () => {},
      },
      loadTimes: () => ({}),
      csi: () => ({}),
      app: { isInstalled: false },
    };

    // Fake browser plugins (headless Chrome has none)
    const fakePlugins = [
      { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
      { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
    ];
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const arr = Object.assign(fakePlugins.slice(), {
          item: i => fakePlugins[i] || null,
          namedItem: n => fakePlugins.find(p => p.name === n) || null,
          refresh: () => {},
        });
        return arr;
      },
    });

    // Languages
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en', 'fr'] });

    // Hardware concurrency (headless often shows 2)
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });

    // Device memory
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

    // Patch WebGL to report real-looking GPU strings
    try {
      const getParam = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel Iris OpenGL Engine';
        return getParam.call(this, parameter);
      };
    } catch {}

    // Permissions API — avoid permission-denied fingerprinting
    try {
      const origQuery = Permissions.prototype.query;
      Permissions.prototype.query = function(parameters) {
        if (parameters.name === 'notifications') {
          return Promise.resolve({ state: Notification.permission });
        }
        return origQuery.call(this, parameters);
      };
    } catch {}
  });
}

// Type like a human: focus, clear, then type char-by-char with random delays
async function humanType(page, selector, text) {
  await page.click(selector);
  await sleep(jitter(200, 300));
  await page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (el) { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }, selector);
  for (const char of text) {
    await page.type(selector, char, { delay: jitter(60, 90) });
  }
  await sleep(jitter(200, 400));
}

function isLoggedIn(url) {
  return url.includes('programme.annecyfestival.com') && !url.includes('account.annecyfestival.com');
}

async function login(page) {
  log('Navigating to homepage...');
  await page.goto('https://programme.annecyfestival.com/en', { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(jitter(1000, 1500));

  const accountLink = await page.$('a:has-text("Account"), a[href*="/en/account"]');
  if (!accountLink) {
    await screenshot(page, 'no_account_link');
    throw new Error('Account link not found on homepage');
  }
  const href = await accountLink.getAttribute('href').catch(() => '');
  log(`Clicking Account link (href=${href})`);
  await accountLink.click();
  await sleep(jitter(500, 500));

  await page.waitForURL(/account\.annecyfestival\.com/, { timeout: 15000 });
  log(`OAuth page: ${page.url()}`);
  await sleep(jitter(800, 800));

  await page.waitForSelector('input[name="citia_username"], input[id="username"], input[type="email"]', { timeout: 10000 });
  log('Login form visible');
  await screenshot(page, 'login_form');

  // Fill email
  const emailSel = await page.$('input[name="citia_username"]') ? 'input[name="citia_username"]'
    : await page.$('input[id="username"]') ? 'input[id="username"]'
    : 'input[type="email"]';
  await humanType(page, emailSel, CONFIG.email);
  log(`Typed email into ${emailSel}`);

  // Fill password
  const passSel = await page.$('input[name="citia_password"]') ? 'input[name="citia_password"]'
    : await page.$('input[id="password"]') ? 'input[id="password"]'
    : 'input[type="password"]';
  await humanType(page, passSel, CONFIG.password);
  log(`Typed password into ${passSel}`);

  await sleep(jitter(600, 600));
  await screenshot(page, 'before_submit');

  await page.click('button[type="submit"]');
  log('Form submitted — waiting for redirect...');

  // Check for OTP/2FA field (appears before redirect if 2FA enabled)
  const otpAppeared = await Promise.race([
    page.waitForSelector('input[name*="otp"], input[name*="code"], input[name*="token"], input[id*="otp"]', { timeout: 5000 }).then(() => true),
    sleep(5000).then(() => false),
  ]);

  if (otpAppeared) {
    await screenshot(page, 'otp_field');
    throw new Error('OTP/2FA field detected — account requires two-factor authentication. Cannot proceed automatically.');
  }

  try {
    await page.waitForURL(/programme\.annecyfestival\.com/, { timeout: 45000 });
    log(`Login SUCCESS — URL: ${page.url()}`);
    await screenshot(page, 'logged_in');
  } catch {
    await screenshot(page, 'login_failed');
    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText).catch(() => '');
    log(`Login redirect timeout — URL: ${url}`);
    log(`Page text: ${text.substring(0, 400)}`);
    if (/(incorrect|invalide|error|vérifiez|verify|wrong)/i.test(text)) {
      throw new Error(`Login rejected: ${text.substring(0, 150)}`);
    }
    throw new Error(`OAuth redirect did not complete within 45s (stuck at ${url})`);
  }
}

async function checkAndBook(page) {
  log('Navigating to event page...');
  await page.goto(CONFIG.eventUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(jitter(1500, 1000));

  if (!isLoggedIn(page.url())) {
    log('Not logged in — session expired');
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

  const bookingTextPatterns = [/^book$/i, /^reserve$/i, /réserv/i, /add to cart/i, /acheter/i, /billet/i, /^ticket/i, /^place/i, /buy now/i, /get ticket/i];
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
      await sleep(jitter(300, 400));
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
  const confirmTexts = [/confirm/i, /continue/i, /continuer/i, /suivant/i, /next/i, /proceed/i, /valider/i, /validate/i, /payer/i, /pay/i];

  for (let step = 1; step <= 8; step++) {
    await sleep(jitter(1000, 500));
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

  // headless:false so Xvfb virtual display is used — bypasses many bot-detection checks
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
    timezoneId: 'Europe/Paris',
  });
  const page = await context.newPage();
  await applyStealthPatches(page);

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
    await sleep(wait);
  }

  await browser.close();
  log('=== Poller finished ===');
})();
