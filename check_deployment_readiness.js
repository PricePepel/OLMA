#!/usr/bin/env node

/**
 * OLMA MVP - Deployment Readiness Check
 * This script checks if all required files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  // SQL migrations
  'update_meeting_system_50_50.sql',
  'add_profile_badges_shop.sql',
  
  // API routes
  'src/app/api/user/ratings/route.ts',
  'src/app/api/shop/badges/route.ts',
  'src/app/api/user/badges/route.ts',
  
  // Components
  'src/components/shop/badges-shop.tsx',
  
  // Updated components
  'src/components/meetings/meeting-invite-modal.tsx',
  'src/components/meetings/meeting-invitation-card.tsx',
  'src/components/meetings/meeting-timer.tsx',
  'src/components/profile/profile-component.tsx',
  'src/components/shop/shop-component.tsx',
  
  // API routes
  'src/app/api/meetings/route.ts',
  'src/app/api/meetings/[id]/route.ts',
];

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkEnvFile() {
  const envFiles = ['.env.local', '.env', '.env.production'];
  let envExists = false;
  
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      envExists = true;
      break;
    }
  }
  
  return envExists;
}

function checkPackageJson() {
  if (!fs.existsSync('package.json')) {
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js'];
  
  return requiredDeps.every(dep => 
    packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
  );
}

function main() {
  console.log('🚀 OLMA MVP - Deployment Readiness Check\n');
  
  let allGood = true;
  
  // Check required files
  console.log('📁 Checking required files...');
  for (const file of REQUIRED_FILES) {
    if (checkFileExists(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - MISSING`);
      allGood = false;
    }
  }
  
  // Check environment file
  console.log('\n🔧 Checking environment configuration...');
  if (checkEnvFile()) {
    console.log('  ✅ Environment file found');
  } else {
    console.log('  ❌ No environment file found (.env.local, .env, or .env.production)');
    allGood = false;
  }
  
  // Check package.json
  console.log('\n📦 Checking package.json...');
  if (checkPackageJson()) {
    console.log('  ✅ package.json and required dependencies found');
  } else {
    console.log('  ❌ package.json or required dependencies missing');
    allGood = false;
  }
  
  // Check TypeScript configuration
  console.log('\n🔧 Checking TypeScript configuration...');
  if (checkFileExists('tsconfig.json')) {
    console.log('  ✅ tsconfig.json found');
  } else {
    console.log('  ❌ tsconfig.json missing');
    allGood = false;
  }
  
  // Check Next.js configuration
  console.log('\n⚡ Checking Next.js configuration...');
  if (checkFileExists('next.config.js')) {
    console.log('  ✅ next.config.js found');
  } else {
    console.log('  ❌ next.config.js missing');
    allGood = false;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('🎉 All checks passed! Ready for deployment to Vercel.');
    console.log('\n📋 Next steps:');
    console.log('1. Run SQL migrations in Supabase:');
    console.log('   - update_meeting_system_50_50.sql');
    console.log('   - add_profile_badges_shop.sql');
    console.log('2. Set environment variables in Vercel');
    console.log('3. Deploy: vercel --prod');
    console.log('4. Test the new 50/50 meeting system');
    console.log('5. Test the rating system');
    console.log('6. Test the badge shop');
  } else {
    console.log('❌ Some checks failed. Please fix the issues above before deploying.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
