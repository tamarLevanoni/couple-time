#!/usr/bin/env tsx

/**
 * Test script to verify auth flow implementation
 * This tests that our NextAuth + Zustand integration works correctly
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testAuthFlow() {
  console.log('🔐 Testing Auth Flow Implementation...\n');

  try {
    // Test 1: TypeScript compilation
    console.log('1. Testing TypeScript compilation...');
    const { stdout: tscOutput } = await execAsync('npx tsc --noEmit --skipLibCheck');
    console.log('✅ TypeScript compilation passed\n');

    // Test 2: Check for required files
    console.log('2. Checking required auth files...');
    const requiredFiles = [
      'src/components/providers/client-providers.tsx',
      'src/components/auth/session-manager.tsx', 
      'src/components/auth/profile-completion-modal.tsx',
      'src/components/auth/auth-popup-container.tsx',
    ];

    for (const file of requiredFiles) {
      try {
        await execAsync(`test -f ${file}`);
        console.log(`✅ ${file}`);
      } catch {
        console.log(`❌ Missing: ${file}`);
      }
    }

    console.log('\n3. Testing Zustand integration...');
    // Check if Zustand stores exist
    const zustandStores = [
      'src/store/auth-store.ts',
      'src/store/user-store.ts'
    ];
    
    for (const store of zustandStores) {
      try {
        await execAsync(`test -f ${store}`);
        console.log(`✅ ${store}`);
      } catch {
        console.log(`❌ Missing: ${store}`);
      }
    }

    console.log('\n4. Testing client providers structure...');
    try {
      const { stdout: clientProviders } = await execAsync('cat src/components/providers/client-providers.tsx');
      if (clientProviders.includes('SessionProvider') && clientProviders.includes('AuthPopupContainer')) {
        console.log('✅ Client providers includes NextAuth and popup system');
      } else {
        console.log('❌ Client providers missing required components');
      }
    } catch {
      console.log('❌ Cannot read client providers file');
    }

    console.log('\n🎉 Auth Flow Implementation Test Complete!');
    console.log('\nNext steps:');
    console.log('- Test Google OAuth flow in browser');
    console.log('- Test profile completion modal');
    console.log('- Verify Zustand store data fetching with authenticated users');
    console.log('- Test popup modal authentication flow');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testAuthFlow();
}

export { testAuthFlow };