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
  log(`Screenshot saved: ${name}`);
}

async function login(page) {
  log('Navigating to login page...');
  await page.goto('https://programme.annecyfestival.com/en/login', { waitUntil: 'networkidle', timeout: 30000 });
  log(`URL after nav: ${page.url()}`);

  // Nuxt SPA — wait for JS to render the form (up to 20s)
  const formSelector = 'input[type="email"], input[name="email"], input[type="text"][name*="user"], input[type="text"][name*="login"], input[type="text"][placeholder*="mail"], input[type="text"][placeholder*="email"]';
  log('Waiting for login form to render...');
  try {
    await page.waitForSelector(formSelector, { timeout: 20000 });
    log('Form detected');
  } catch {
    // Form didn't appear — dump what IS on the page
    await screenshot(page, 'login_no_form');
    const text = await page.evaluate(() => document.body.innerText);
    const html = await page.content();
    log('Page text: ' + text.substring(0, 500));
    log('Page HTML inputs: ' + (html.match(/<input[^>]*>/g) || []).join(' | '));
    // Try to find any input at all
    const inputs = await page.$$eval('input', els => els.map(e => `${e.type}|${e.name}|${e.id}|${e.placeholder}`));
    log('All inputs found: ' + JSON.stringify(inputs));
    throw new Error('Login form did not render within 20s');
  }

  await screenshot(page, 'login_form_visible');

  // Fill email
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[type="text"][name*="user"]',
    'input[type="text"][placeholder*="mail" i]',
    'input[type="text"][placeholder*="email" i]',
    'input[type="text"]',
  ];
  let emailFilled = false;
  for (const sel of emailSelectors) {
    try {
      await page.fill(sel, CONFIG.email, { timeout: 3000 });
      emailFilled = true;
      log(`Email filled (${sel})`);
      break;
    } catch {}
  }

  // Fill password
  const passSelectors = ['input[type="password"]', 'input[name="password"]', 'input[id*="pass"]'];
  let passFilled = false;
  for (const sel of passSelectors) {
    try {
      await page.fill(sel, CONFIG.password, { timeout: 3000 });
      passFilled = true;
      log(`Password filled (${sel})`);
      break;
    } catch {}
  }

  if (!emailFilled || !passFilled) {
    await screenshot(page, 'login_fill_failed');
    const inputs = await page.$$eval('input', els => els.map(e => `${e.type}|${e.name}|${e.id}|${e.placeholder}`));
    log('All inputs: ' + JSON.stringify(inputs));
    throw new Error(`Could not fill form — emailFilled=${emailFilled} passFilled=${passFilled}`);
  }

  // Submit
  const submitSelectors = [
    'button[type="submit"]', 'input[type="submit"]',
    'button:has-text("Login")', 'button:has-text("Sign in")',
    'button:has-text("Connexion")', 'button:has-text("Se connecter")',
    'button:has-text("Continuer")', 'button:has-text("Continue")',
  ];
  let submitted = false;
  for (const sel of submitSelectors) {
    try {
      await page.click(sel, { timeout: 3000 });
      submitted = true;
      log(`Submit clicked (${sel})`);
      break;
    } catch {}
  }
  if (!submitted) {
    await page.keyboard.press('Enter');
    log('Submitted via Enter key');
  }

  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await screenshot(page, 'after_login');
  log(`Post-login URL: ${page.url()}`);

  // Check we're actually logged in (not back on login page)
  if (page.url().includes('/login')) {
    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    if (pageText.includes('incorrect') || pageText.includes('invalid') || pageText.includes('error')) {
      throw new Error('Login failed — incorrect credentials or site error');
    }
    log('Warning: still on login page after submit, proceeding anyway');
  }
}

async function checkAndBook(page) {
  log('Checking event page...');
  await page.goto(CONFIG.eventUrl, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for Nuxt to hydrate
  await page.waitForTimeout(2000);

  const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
  log(`Page preview: ${pageText.substring(0, 300).replace(/\n/g, ' ')}`);

  // Dump all buttons/links to understand the page
  const allButtons = await page.$$eval('button, a', els =>
    els.map(e => ({ tag: e.tagName, text: e.innerText?.trim().substring(0, 80), disabled: e.disabled, class: e.className.substring(0, 60) }))
       .filter(e => e.text)
  );
  log('Buttons/links on page: ' + JSON.stringify(allButtons.slice(0, 20)));

  const soldOutPhrases = ['sold out', 'complet', 'no availability', 'plus disponible', 'epuise', 'no places', 'guichet fermé'];
  for (const phrase of soldOutPhrases) {
    if (pageText.includes(phrase)) {
      log(`Unavailable — "${phrase}" detected`);
      return false;
    }
  }

  const bookingSelectors = [
    'button:has-text("Book")', 'button:has-text("Reserve")',
    'button:has-text("Réserver")', 'button:has-text("Réservation")',
    'a:has-text("Book")', 'a:has-text("Reserve")', 'a:has-text("Réserver")',
    'button:has-text("Add to cart")', 'button:has-text("Acheter")',
    'button:has-text("Billets")', 'button:has-text("Ticket")',
    '[class*="book"]:not([disabled])', '[class*="reserv"]:not([disabled])',
    '[class*="ticket"]:not([disabled])',
  ];

  for (const sel of bookingSelectors) {
    try {
      const el = await page.$(sel);
      if (!el) continue;
      if (await el.isVisible() && await el.isEnabled()) {
        const text = await el.innerText().catch(() => '');
        log(`BOOKING BUTTON FOUND: "${text}" (${sel}) — clicking!`);
        await screenshot(page, 'slot_available');
        await el.click();
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
        await screenshot(page, 'after_booking_click');
        log(`Post-click URL: ${page.url()}`);
        return await completeBooking(page);
      }
    } catch {}
  }

  log('No active booking button found — slot not yet open');
  return false;
}

async function completeBooking(page) {
  log('Attempting to complete booking...');
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
          log(`Booking step ${step}: clicking "${text}"`);
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
  const success = ['confirmation', 'confirmed', 'success', 'réservation confirmée', 'reservation confirmee', 'thank you', 'merci'].some(p => finalText.includes(p));
  log(success ? 'BOOKING CONFIRMED!' : 'Booking flow complete — verify outcome manually');
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
      if (booked) { log('SUCCESS — reservation made! Exiting.'); break; }
    } catch (e) {
      log(`Poll error: ${e.message}`);
      if (/(login|auth|session|403|401|incorrect)/i.test(e.message)) {
        await login(page).catch(le => log(`Re-login failed: ${le.message}`));
      }
    }
    if (!booked) {
      log(`Waiting ${CONFIG.pollIntervalMs / 1000}s before next check...`);
      await new Promise(r => setTimeout(r, CONFIG.pollIntervalMs));
    }
  }

  await browser.close();
  log('=== Poller finished ===');
})();
