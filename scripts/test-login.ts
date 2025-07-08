#!/usr/bin/env tsx

// Test login API endpoint
async function testLogin() {
  console.log('🔐 Testing login API endpoint...\n');

  const testCredentials = {
    email: 'admin@gamerentals.org.il',
    password: 'admin123'
  };

  try {
    const response = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: testCredentials.email,
        password: testCredentials.password,
        csrfToken: 'test', // This would normally come from getCSRFToken()
        callbackUrl: 'http://localhost:3001',
        json: 'true'
      }),
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log(`Response body:`, data);

  } catch (error) {
    console.error('❌ Login test failed:', error);
  }
}

testLogin();