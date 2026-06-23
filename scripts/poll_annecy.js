const { chromium } = require('playwright');
const fs = require('fs');

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
  log(`Screenshot: ${file}`);
}

async function login(page) {
  log('Navigating to login page...');
  await page.goto('https://programme.annecyfestival.com/en/login', { waitUntil: 'networkidle', timeout: 30000 });
  await screenshot(page, 'login_page');
  log(`Login page URL: ${page.url()}`);

  const emailSelectors = ['input[type="email"]', 'input[name="email"]', 'input[name="username"]', 'input[id*="email"]', 'input[id*="user"]'];
  const passSelectors  = ['input[type="password"]', 'input[name="password"]', 'input[id*="pass"]'];

  let emailFilled = false;
  for (const sel of emailSelectors) {
    try { await page.fill(sel, CONFIG.email, { timeout: 3000 }); emailFilled = true; log(`Email filled (${sel})`); break; } catch {}
  }

  let passFilled = false;
  for (const sel of passSelectors) {
    try { await page.fill(sel, CONFIG.password, { timeout: 3000 }); passFilled = true; log(`Password filled (${sel})`); break; } catch {}
  }

  if (!emailFilled || !passFilled) {
    await screenshot(page, 'login_fields_missing');
    const html = await page.content();
    log('Page HTML snippet: ' + html.substring(0, 2000));
    throw new Error('Login form fields not found — see logs for page HTML');
  }

  const submitSelectors = [
    'button[type="submit"]', 'input[type="submit"]',
    'button:has-text("Login")', 'button:has-text("Sign in")',
    'button:has-text("Connexion")', 'button:has-text("Se connecter")'
  ];
  let submitted = false;
  for (const sel of submitSelectors) {
    try { await page.click(sel, { timeout: 3000 }); submitted = true; log(`Submit clicked (${sel})`); break; } catch {}
  }
  if (!submitted) { await page.keyboard.press('Enter'); log('Submitted via Enter'); }

  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await screenshot(page, 'after_login');
  log(`Post-login URL: ${page.url()}`);
}

async function checkAndBook(page) {
  log(`Checking event page...`);
  await page.goto(CONFIG.eventUrl, { waitUntil: 'networkidle', timeout: 30000 });

  const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
  log(`Page preview: ${pageText.substring(0, 200).replace(/\n/g, ' ')}`);

  const soldOutPhrases = ['sold out', 'complet', 'no availability', 'plus disponible', 'epuise', 'no places'];
  for (const phrase of soldOutPhrases) {
    if (pageText.includes(phrase)) {
      log(`Unavailable — "${phrase}" detected`);
      return false;
    }
  }

  const bookingSelectors = [
    'button:has-text("Book")', 'button:has-text("Reserve")',
    'button:has-text("Reserver")', 'button:has-text("Reservation")',
    'a:has-text("Book")', 'a:has-text("Reserve")', 'a:has-text("Reserver")',
    'button:has-text("Add to cart")', 'button:has-text("Acheter")',
    '[class*="book"]:not([disabled])', '[class*="reserv"]:not([disabled])',
  ];

  for (const sel of bookingSelectors) {
    try {
      const el = await page.$(sel);
      if (!el) continue;
      if (await el.isVisible() && await el.isEnabled()) {
        const text = await el.innerText().catch(() => '');
        log(`BOOKING BUTTON FOUND: "${text}" — clicking now!`);
        await screenshot(page, 'slot_available');
        await el.click();
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
        await screenshot(page, 'after_booking_click');
        log(`Post-click URL: ${page.url()}`);
        return await completeBooking(page);
      }
    } catch {}
  }

  log('No active booking button found');
  return false;
}

async function completeBooking(page) {
  log('Completing booking flow...');
  const confirmSelectors = [
    'button:has-text("Confirm")', 'button:has-text("Confirmer")',
    'button:has-text("Continue")', 'button:has-text("Continuer")',
    'button:has-text("Next")', 'button:has-text("Suivant")',
    'button:has-text("Proceed")', 'button[type="submit"]',
  ];

  for (let step = 1; step <= 6; step++) {
    let clicked = false;
    for (const sel of confirmSelectors) {
      try {
        const el = await page.$(sel);
        if (!el) continue;
        if (await el.isVisible() && await el.isEnabled()) {
          const text = await el.innerText().catch(() => '');
          log(`Step ${step}: clicking "${text}"`);
          await el.click();
          await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
          await screenshot(page, `booking_step${step}`);
          clicked = true;
          break;
        }
      } catch {}
    }
    if (!clicked) break;
  }

  const finalText = await page.evaluate(() => document.body.innerText.toLowerCase());
  const success = ['confirmation', 'confirmed', 'success', 'reservation confirmee', 'thank you', 'merci'].some(p => finalText.includes(p));
  log(success ? 'BOOKING CONFIRMED!' : 'Booking flow ended — check screenshots to verify');
  await screenshot(page, 'final_state');
  return true;
}

(async () => {
  log('=== Annecy Festival Reservation Poller ===');
  log(`Event: ${CONFIG.eventUrl}`);
  log(`Polling every ${CONFIG.pollIntervalMs / 1000}s`);

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
      if (booked) { log('SUCCESS — exiting poller'); break; }
    } catch (e) {
      log(`Error: ${e.message}`);
      if (/(login|auth|session|403|401)/i.test(e.message)) {
        await login(page).catch(le => log(`Re-login failed: ${le.message}`));
      }
    }
    if (!booked) {
      log(`Next check in ${CONFIG.pollIntervalMs / 1000}s...`);
      await new Promise(r => setTimeout(r, CONFIG.pollIntervalMs));
    }
  }

  await browser.close();
})();
