#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Single project screenshot script
async function takeScreenshot(url, outputPath) {
  const { chromium } = require('@playwright/test');

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  try {
    console.log(`📸 Taking screenshot of: ${url}`);

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    await page.screenshot({
      path: outputPath,
      fullPage: true
    });

    console.log(`✅ Screenshot saved: ${outputPath}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to screenshot ${url}:`, error.message);
    return false;
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: node screenshot-single.js <project-slug> [additional-page]');
    console.log('');
    console.log('Examples:');
    console.log('  node screenshot-single.js copypal');
    console.log('  node screenshot-single.js drawiodb about');
    console.log('  node screenshot-single.js filedb demo');
    process.exit(1);
  }

  const projectSlug = args[0];
  const additionalPage = args[1] || '';

  // Load project
  const projectPath = path.join(__dirname, 'content', 'projects', `${projectSlug}.json`);

  if (!fs.existsSync(projectPath)) {
    console.error(`❌ Project file not found: ${projectPath}`);
    process.exit(1);
  }

  const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

  if (!project.liveUrl) {
    console.error(`❌ No liveUrl found in project: ${projectSlug}`);
    process.exit(1);
  }

  // Ensure images directory exists
  const imagesDir = path.join(__dirname, 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Construct URL and filename
  let url = project.liveUrl;
  let suffix = 'main';

  if (additionalPage) {
    url = url.replace(/\/$/, '') + '/' + additionalPage;
    suffix = additionalPage;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${projectSlug}-${suffix}-${timestamp}.png`;
  const outputPath = path.join(imagesDir, filename);

  console.log(`🎯 Project: ${project.title}`);
  console.log(`🔗 URL: ${url}`);
  console.log(`📁 Output: ${filename}`);

  // Check if Playwright is available
  try {
    require('@playwright/test');
  } catch (error) {
    console.error('❌ Playwright not installed. Run: npm install -D @playwright/test');
    process.exit(1);
  }

  // Take screenshot
  const success = await takeScreenshot(url, outputPath);

  if (success) {
    console.log(`\n🎉 Screenshot completed!`);
    console.log(`📄 To add to project JSON, update screens array with:`);
    console.log(`   "/images/${filename}"`);
  } else {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}