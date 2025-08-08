#!/usr/bin/env node

const axios = require('axios');

// Test different API URLs
const testUrls = [
  'http://localhost:5000/api/health',
  'http://10.0.2.2:5000/api/health',
  'http://192.168.43.211:5000/api/health',
  'http://192.168.56.1:5000/api/health'
];

async function testConnection(url) {
  try {
    console.log(`🔗 Testing: ${url}`);
    const response = await axios.get(url, { timeout: 3000 });
    console.log(`✅ SUCCESS: ${url}`);
    console.log(`   Response: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${url}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testAllConnections() {
  console.log('🚀 Testing API connections...\n');
  
  let successCount = 0;
  
  for (const url of testUrls) {
    const success = await testConnection(url);
    if (success) successCount++;
    console.log(''); // Empty line for readability
  }
  
  console.log(`📊 Results: ${successCount}/${testUrls.length} connections successful`);
  
  if (successCount === 0) {
    console.log('\n❌ No API connections working!');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure backend server is running: npm start');
    console.log('   2. Check if backend is on port 5000');
    console.log('   3. Verify firewall settings');
    console.log('   4. Run "npm run find-ip" to check your network IPs');
  } else {
    console.log('\n✅ At least one connection is working!');
    console.log('💡 The mobile app should automatically detect the working connection.');
  }
}

testAllConnections().catch(console.error);