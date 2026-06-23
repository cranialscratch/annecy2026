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

async function dumpPage(page, label) {
  const text = await page.evaluate(() => document.body.innerText);
  const inputs = await page.$$eval('input', els => els.map(e => `${e.type}|${e.name}|${e.id}|${e.placeholder}`));
  const links = await page.$$eval('a, button', els => els.map(e => e.innerText?.trim()).filter(t => t && t.length < 60));
  log(`[${label}] URL: ${page.url()}`);
  log(`[${label}] Text: ${text.substring(0, 300).replace(/\n/g, ' ')}`);
  log(`[${label}] Inputs: ${JSON.stringify(inputs)}`);
  log(`[${label}] Links/buttons: ${JSON.stringify(links.slice(0, 20))}`);
}

async function login(page) {
  // Step 1: go to homepage and explore nav
  log('Going to homepage...');
  await page.goto('https://programme.annecyfestival.com/en', { waitUntil: 'networkidle', timeout: 30000 });
  await screenshot(page, '01_homepage');
  await dumpPage(page, 'homepage');

  // Step 2: look for Account/Login/Sign in link in nav
  const loginTriggers = [
    'a:has-text("Account")', 'a:has-text("Login")', 'a:has-text("Sign in")',
    'a:has-text("Connexion")', 'a:has-text("Mon compte")', 'a:has-text("Se connecter")',
    'button:has-text("Account")', 'button:has-text("Login")', 'button:has-text("Sign in")',
    'button:has-text("Connexion")', '[href*="login"]', '[href*="account"]', '[href*="signin"]',
  ];

  let clicked = false;
  for (const sel of loginTriggers) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible()) {
        const text = await el.innerText().catch(() => '');
        const href = await el.getAttribute('href').catch(() => '');
        log(`Clicking login trigger: "${text}" href="${href}" (${sel})`);
        await el.click();
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
        await screenshot(page, '02_after_account_click');
        await dumpPage(page, 'after_account_click');
        clicked = true;
        break;
      }
    } catch {}
  }

  if (!clicked) {
    // Try navigating directly to common account URLs
    for (const path of ['/en/account', '/en/my-account', '/en/user', '/en/profile', '/en/auth']) {
      log(`Trying direct path: ${path}`);
      await page.goto(`https://programme.annecyfestival.com${path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await dumpPage(page, `path_${path}`);
      const inputs = await page.$$('input');
      if (inputs.length > 0) { log(`Found inputs at ${path}`); clicked = true; break; }
    }
  }

  await screenshot(page, '03_pre_form');

  // Step 3: wait for a login form (email/password inputs)
  const anyInputSel = 'input[type="email"], input[type="password"], input[name*="email"], input[name*="user"], input[placeholder*="mail" i], input[placeholder*="email" i]';
  log('Waiting for login form inputs...');
  try {
    await page.waitForSelector(anyInputSel, { timeout: 15000 });
    log('Login form found');
  } catch {
    await screenshot(page, '03_no_form');
    await dumpPage(page, 'no_form');
    throw new Error('Login form not found after clicking Account — see logs for page state');
  }

  await screenshot(page, '04_form_visible');

  // Fill email
  const emailSels = ['input[type="email"]', 'input[name*="email"]', 'input[name*="user"]', 'input[placeholder*="mail" i]', 'input[placeholder*="email" i]', 'input[type="text"]'];
  let emailFilled = false;
  for (const sel of emailSels) {
    try { await page.fill(sel, CONFIG.email, { timeout: 3000 }); emailFilled = true; log(`Email filled (${sel})`); break; } catch {}
  }

  // Fill password
  let passFilled = false;
  for (const sel of ['input[type="password"]', 'input[name*="pass"]']) {
    try { await page.fill(sel, CONFIG.password, { timeout: 3000 }); passFilled = true; log(`Password filled (${sel})`); break; } catch {}
  }

  if (!emailFilled || !passFilled) {
    const inputs = await page.$$eval('input', els => els.map(e => `${e.type}|${e.name}|${e.id}|${e.placeholder}`));
    log('All inputs: ' + JSON.stringify(inputs));
    throw new Error(`Fill failed — emailFilled=${emailFilled} passFilled=${passFilled}`);
  }

  // Submit
  const submitSels = ['button[type="submit"]', 'input[type="submit"]', 'button:has-text("Login")', 'button:has-text("Sign in")', 'button:has-text("Connexion")', 'button:has-text("Se connecter")', 'button:has-text("Continuer")', 'button:has-text("Continue")'];
  let submitted = false;
  for (const sel of submitSels) {
    try { await page.click(sel, { timeout: 3000 }); submitted = true; log(`Submitted (${sel})`); break; } catch {}
  }
  if (!submitted) { await page.keyboard.press('Enter'); log('Submitted via Enter'); }

  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await screenshot(page, '05_after_login');
  log(`Post-login URL: ${page.url()}`);
}

async function checkAndBook(page) {
  log('Checking event page...');
  await page.goto(CONFIG.eventUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
  log(`Page preview: ${pageText.substring(0, 300).replace(/\n/g, ' ')}`);

  const allButtons = await page.$$eval('button, a', els =>
    els.map(e => ({ text: e.innerText?.trim().substring(0, 60), disabled: e.disabled, class: e.className.substring(0, 40) }))
       .filter(e => e.text)
  );
  log('Interactive elements: ' + JSON.stringify(allButtons.slice(0, 25)));

  const soldOutPhrases = ['sold out', 'complet', 'no availability', 'plus disponible', 'epuise', 'guichet fermé', 'no places'];
  for (const phrase of soldOutPhrases) {
    if (pageText.includes(phrase)) { log(`Unavailable — "${phrase}"`); return false; }
  }

  const bookingSels = [
    'button:has-text("Book")', 'button:has-text("Reserve")',
    'button:has-text("Réserver")', 'button:has-text("Réservation")',
    'a:has-text("Book")', 'a:has-text("Réserver")',
    'button:has-text("Add to cart")', 'button:has-text("Acheter")',
    'button:has-text("Billets")', 'button:has-text("Ticket")',
  ];

  for (const sel of bookingSels) {
    try {
      const el = await page.$(sel);
      if (!el) continue;
      if (await el.isVisible() && await el.isEnabled()) {
        const text = await el.innerText().catch(() => '');
        log(`BOOKING BUTTON FOUND: "${text}" — clicking!`);
        await screenshot(page, 'slot_available');
        await el.click();
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
        log(`Post-click URL: ${page.url()}`);
        return await completeBooking(page);
      }
    } catch {}
  }

  log('No active booking button — not yet available');
  return false;
}

async function completeBooking(page) {
  log('Completing booking...');
  const confirmSels = ['button:has-text("Confirm")', 'button:has-text("Confirmer")', 'button:has-text("Continue")', 'button:has-text("Continuer")', 'button:has-text("Next")', 'button:has-text("Suivant")', 'button[type="submit"]'];
  for (let step = 1; step <= 6; step++) {
    let clicked = false;
    for (const sel of confirmSels) {
      try {
        const el = await page.$(sel);
        if (el && await el.isVisible() && await el.isEnabled()) {
          const text = await el.innerText().catch(() => '');
          log(`Step ${step}: "${text}"`);
          await el.click();
          await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
          await screenshot(page, `booking_step${step}`);
          clicked = true; break;
        }
      } catch {}
    }
    if (!clicked) break;
  }
  const finalText = await page.evaluate(() => document.body.innerText.toLowerCase());
  const ok = ['confirmation', 'confirmed', 'success', 'réservation confirmée', 'thank you', 'merci'].some(p => finalText.includes(p));
  log(ok ? 'BOOKING CONFIRMED!' : 'Booking flow done — check screenshots');
  await screenshot(page, 'final_state');
  return true;
}

(async () => {
  log('=== Annecy Festival Reservation Poller ===');
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
      if (booked) { log('SUCCESS — done!'); break; }
    } catch (e) {
      log(`Error: ${e.message}`);
      if (/(login|auth|session|403|401)/i.test(e.message)) {
        await login(page).catch(le => log(`Re-login failed: ${le.message}`));
      }
    }
    if (!booked) {
      log(`Waiting ${CONFIG.pollIntervalMs / 1000}s...`);
      await new Promise(r => setTimeout(r, CONFIG.pollIntervalMs));
    }
  }

  await browser.close();
  log('=== Done ===');
})();
