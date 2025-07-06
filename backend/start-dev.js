#!/usr/bin/env node

/**
 * Development startup script for Rent My Threads Backend
 * This script checks dependencies and starts the development server
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = (message, color = 'white') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const checkFile = (filePath, name) => {
  if (fs.existsSync(filePath)) {
    log(`✓ ${name} found`, 'green');
    return true;
  } else {
    log(`✗ ${name} not found`, 'red');
    return false;
  }
};

const checkEnvVar = (varName, required = true) => {
  const value = process.env[varName];
  if (value) {
    log(`✓ ${varName} is set`, 'green');
    return true;
  } else {
    log(`${required ? '✗' : '⚠'} ${varName} is ${required ? 'missing' : 'not set'}`, required ? 'red' : 'yellow');
    return !required;
  }
};

const main = async () => {
  log('\n🚀 Rent My Threads Backend - Development Startup\n', 'cyan');

  let allGood = true;

  // Check required files
  log('📁 Checking required files...', 'blue');
  allGood &= checkFile('.env', '.env file');
  allGood &= checkFile('package.json', 'package.json');
  allGood &= checkFile('server.js', 'server.js');
  allGood &= checkFile('../rent_my_threads_schema.sql', 'Database schema');

  log('');

  // Check Node.js version
  log('🔍 Checking Node.js version...', 'blue');
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      log(`✓ Node.js ${nodeVersion} (meets requirement: >=18.0.0)`, 'green');
    } else {
      log(`✗ Node.js ${nodeVersion} (requires >=18.0.0)`, 'red');
      allGood = false;
    }
  } catch (error) {
    log('✗ Could not determine Node.js version', 'red');
    allGood = false;
  }

  log('');

  // Load environment variables
  if (fs.existsSync('.env')) {
    log('🔧 Loading environment variables...', 'blue');
    require('dotenv').config();

    // Check critical environment variables
    log('🔐 Checking environment variables...', 'blue');
    allGood &= checkEnvVar('SUPABASE_URL');
    allGood &= checkEnvVar('SUPABASE_ANON_KEY');
    allGood &= checkEnvVar('JWT_SECRET');
    
    // Check optional but recommended variables
    checkEnvVar('STRIPE_SECRET_KEY', false);
    checkEnvVar('SENDGRID_API_KEY', false);
    checkEnvVar('TWILIO_ACCOUNT_SID', false);
  }

  log('');

  // Check if dependencies are installed
  log('📦 Checking dependencies...', 'blue');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const nodeModulesExists = fs.existsSync('node_modules');
    
    if (nodeModulesExists) {
      log('✓ node_modules directory exists', 'green');
      
      // Check for some critical dependencies
      const criticalDeps = ['express', '@supabase/supabase-js', 'jsonwebtoken', 'joi'];
      let depsOk = true;
      
      for (const dep of criticalDeps) {
        try {
          require.resolve(dep);
          log(`  ✓ ${dep}`, 'green');
        } catch {
          log(`  ✗ ${dep} not found`, 'red');
          depsOk = false;
        }
      }
      
      if (!depsOk) {
        log('\n⚠️ Some dependencies are missing. Run: npm install', 'yellow');
        allGood = false;
      }
    } else {
      log('✗ node_modules not found', 'red');
      log('Run: npm install', 'yellow');
      allGood = false;
    }
  } catch (error) {
    log('✗ Could not read package.json', 'red');
    allGood = false;
  }

  log('');

  // Check database connection (if possible)
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    log('🗄️ Testing database connection...', 'blue');
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      
      // Simple test query
      const { error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
      
      if (error) {
        log(`⚠️ Database connection test failed: ${error.message}`, 'yellow');
        log('   Make sure your Supabase credentials are correct and the schema is applied', 'yellow');
      } else {
        log('✓ Database connection successful', 'green');
      }
    } catch (error) {
      log(`⚠️ Could not test database connection: ${error.message}`, 'yellow');
    }
  }

  log('');

  // Summary
  if (allGood) {
    log('🎉 All checks passed! Starting development server...\n', 'green');
    
    // Start the development server
    const serverProcess = spawn('node', ['server.js'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log('\n\n⏹️ Shutting down development server...', 'yellow');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      log('\n\n⏹️ Shutting down development server...', 'yellow');
      serverProcess.kill('SIGTERM');
      process.exit(0);
    });

    serverProcess.on('close', (code) => {
      if (code !== 0) {
        log(`\n❌ Server exited with code ${code}`, 'red');
        process.exit(code);
      } else {
        log('\n✅ Server exited successfully', 'green');
        process.exit(0);
      }
    });

  } else {
    log('❌ Some checks failed. Please fix the issues above before starting the server.', 'red');
    log('\n📋 Quick setup checklist:', 'cyan');
    log('   1. Copy .env.example to .env and fill in your values');
    log('   2. Run: npm install');
    log('   3. Set up your Supabase database with the provided schema');
    log('   4. Ensure Node.js version is 18 or higher');
    log('   5. Run this script again: npm run dev');
    
    process.exit(1);
  }
};

// Run the startup checks
main().catch((error) => {
  log(`\n❌ Startup failed: ${error.message}`, 'red');
  log(error.stack, 'red');
  process.exit(1);
});
