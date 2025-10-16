#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if Playwright is installed, if not install it
function ensurePlaywright() {
  try {
    require('@playwright/test');
  } catch (error) {
    console.log('Installing Playwright...');
    execSync('npm install -D @playwright/test', { stdio: 'inherit' });
    execSync('npx playwright install', { stdio: 'inherit' });
  }
}

// Function to load all project JSON files
function loadProjects() {
  const projectsDir = path.join(__dirname, 'content', 'projects');
  const files = fs.readdirSync(projectsDir);
  const projects = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(projectsDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (content.liveUrl && content.status === 'live') {
        projects.push({
          ...content,
          filename: file
        });
      }
    }
  }

  return projects;
}

// Function to take screenshot using Playwright
async function takeScreenshot(url, outputPath, options = {}) {
  const { chromium } = require('@playwright/test');

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  try {
    console.log(`Taking screenshot of: ${url}`);

    // Navigate to page with timeout
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait a bit more for any animations/loading
    await page.waitForTimeout(2000);

    // Take full page screenshot
    await page.screenshot({
      path: outputPath,
      fullPage: options.fullPage !== false
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

// Function to update project JSON with screenshot info
function updateProjectJSON(project, screenshots) {
  const projectPath = path.join(__dirname, 'content', 'projects', project.filename);
  const updatedProject = {
    ...project,
    screens: screenshots.map(s => `/images/${s}`),
    updatedAt: new Date().toISOString()
  };

  // Remove filename from the object before saving
  delete updatedProject.filename;

  fs.writeFileSync(projectPath, JSON.stringify(updatedProject, null, 2));
  console.log(`📝 Updated ${project.filename} with ${screenshots.length} screenshots`);
}

// Main function
async function main() {
  console.log('🚀 Starting screenshot generation for all projects...\n');

  // Ensure Playwright is installed
  ensurePlaywright();

  // Load all projects
  const projects = loadProjects();
  console.log(`Found ${projects.length} live projects to screenshot\n`);

  if (projects.length === 0) {
    console.log('No live projects found!');
    return;
  }

  // Ensure images directory exists
  const imagesDir = path.join(__dirname, 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Process each project
  for (const project of projects) {
    console.log(`📸 Processing: ${project.title} (${project.slug})`);
    console.log(`🔗 URL: ${project.liveUrl}`);

    const screenshots = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // Main screenshot
    const mainScreenshot = `${project.slug}-main-${timestamp}.png`;
    const mainPath = path.join(imagesDir, mainScreenshot);

    const success = await takeScreenshot(project.liveUrl, mainPath);

    if (success) {
      screenshots.push(mainScreenshot);

      // Try to take additional screenshots for specific pages if they exist
      const additionalUrls = [
        { suffix: 'about', path: '/about' },
        { suffix: 'features', path: '/features' },
        { suffix: 'demo', path: '/demo' },
        { suffix: 'docs', path: '/docs' },
      ];

      for (const additional of additionalUrls) {
        try {
          const testUrl = project.liveUrl.replace(/\/$/, '') + additional.path;
          const screenshotName = `${project.slug}-${additional.suffix}-${timestamp}.png`;
          const screenshotPath = path.join(imagesDir, screenshotName);

          // Test if page exists (quick check)
          const { chromium } = require('@playwright/test');
          const browser = await chromium.launch();
          const page = await browser.newPage();

          try {
            const response = await page.goto(testUrl, { timeout: 10000 });
            if (response.status() === 200) {
              await browser.close();
              const additionalSuccess = await takeScreenshot(testUrl, screenshotPath);
              if (additionalSuccess) {
                screenshots.push(screenshotName);
              }
            } else {
              await browser.close();
            }
          } catch {
            await browser.close();
          }
        } catch (error) {
          // Ignore errors for additional pages
        }
      }

      // Update project JSON with screenshots
      updateProjectJSON(project, screenshots);
    }

    console.log(`✨ Completed ${project.title}: ${screenshots.length} screenshots\n`);
  }

  console.log('🎉 All projects processed!');
  console.log(`📁 Screenshots saved in: ${imagesDir}`);
  console.log('📄 Project JSON files updated with screenshot references');
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { takeScreenshot, loadProjects, updateProjectJSON };