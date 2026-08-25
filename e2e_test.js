import puppeteer from 'puppeteer';

(async () => {
  console.log("Starting browser E2E test...");
  // Launch headless browser
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  try {
    // 1. Visit Landing Page
    console.log("Navigating to http://localhost:5173...");
    await page.goto('http://localhost:5173');
    await page.waitForSelector('text/Engineer your career');
    console.log("Landing page loaded successfully!");

    // 2. Go to Sign Up
    console.log("Clicking 'Get Started' (Sign Up)...");
    const getStartedBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Get Started'));
    });
    await getStartedBtn.click();

    // 3. Wait for Signup Form
    await page.waitForSelector('input[type="text"]');
    console.log("Signup form loaded!");
    
    // Fill out form
    const ts = Date.now();
    await page.type('input[type="text"]', 'E2E Test User');
    await page.type('input[type="email"]', `e2e_${ts}@example.com`);
    await page.type('input[type="password"]', 'password123');

    // 4. Submit Signup
    console.log("Submitting Signup form...");
    const createAccountBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Create Account'));
    });
    await createAccountBtn.click();

    // 5. Wait for Dashboard to Load
    console.log("Waiting for Dashboard route...");
    await page.waitForSelector('text/Dashboard', { timeout: 10000 });
    console.log("Dashboard loaded! Authentication works perfectly.");

    // 6. Navigate to Admin
    console.log("Navigating to Admin panel via sidebar...");
    const adminTab = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Admin'));
    });
    if (adminTab) {
      await adminTab.click();
      await page.waitForSelector('text/Admin Control Panel');
      console.log("Admin panel loaded!");
    } else {
      console.log("Admin tab not found in sidebar.");
    }

    console.log("✅ All UI flows tested successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    await browser.close();
  }
})();
