#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test script to check project loading and basic functionality
function loadProjects() {
  const projectsDir = path.join(__dirname, 'content', 'projects');
  const files = fs.readdirSync(projectsDir);
  const projects = [];

  console.log('📁 Found project files:');

  for (const file of files) {
    if (file.endsWith('.json')) {
      console.log(`  - ${file}`);

      try {
        const filePath = path.join(projectsDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (content.liveUrl && content.status === 'live') {
          projects.push({
            title: content.title,
            slug: content.slug,
            liveUrl: content.liveUrl,
            status: content.status,
            filename: file,
            hasScreens: content.screens && content.screens.length > 0
          });
        }
      } catch (error) {
        console.log(`    ❌ Error parsing ${file}: ${error.message}`);
      }
    }
  }

  return projects;
}

function main() {
  console.log('🧪 Testing project screenshot system...\n');

  const projects = loadProjects();

  console.log(`\n📊 Found ${projects.length} live projects:`);

  projects.forEach(project => {
    console.log(`\n📋 ${project.title}`);
    console.log(`   📝 Slug: ${project.slug}`);
    console.log(`   🔗 URL: ${project.liveUrl}`);
    console.log(`   📸 Has screenshots: ${project.hasScreens ? '✅' : '❌'}`);
    console.log(`   📄 File: ${project.filename}`);
  });

  console.log(`\n🎯 Projects needing screenshots: ${projects.filter(p => !p.hasScreens).length}`);
  console.log(`✅ Projects with screenshots: ${projects.filter(p => p.hasScreens).length}`);

  // Test images directory
  const imagesDir = path.join(__dirname, 'public', 'images');
  console.log(`\n📁 Images directory: ${imagesDir}`);
  console.log(`📁 Exists: ${fs.existsSync(imagesDir) ? '✅' : '❌'}`);

  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir);
    console.log(`📷 Image files: ${imageFiles.length}`);

    const screenshotFiles = imageFiles.filter(f =>
      f.includes('screenshot') || f.includes('screencapture') || projects.some(p => f.includes(p.slug))
    );
    console.log(`📸 Screenshot files: ${screenshotFiles.length}`);

    if (screenshotFiles.length > 0) {
      console.log('   Screenshots found:');
      screenshotFiles.slice(0, 5).forEach(f => console.log(`     - ${f}`));
      if (screenshotFiles.length > 5) {
        console.log(`     ... and ${screenshotFiles.length - 5} more`);
      }
    }
  }

  console.log(`\n✨ Test complete!`);
  console.log(`\n🚀 To run full screenshot generation:`);
  console.log(`   npm run screenshots`);
}

main();