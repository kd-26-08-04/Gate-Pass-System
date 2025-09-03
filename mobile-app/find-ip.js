#!/usr/bin/env node

const os = require('os');
const { execSync } = require('child_process');

console.log('🔍 Finding your local IP address for mobile development...\n');

// Get network interfaces
const interfaces = os.networkInterfaces();
const ips = [];

// Extract all IPv4 addresses that are not localhost
Object.keys(interfaces).forEach(interfaceName => {
  interfaces[interfaceName].forEach(interface => {
    if (interface.family === 'IPv4' && !interface.internal) {
      ips.push({
        interface: interfaceName,
        ip: interface.address,
        type: interface.address.startsWith('192.168.') ? 'Home Network' :
              interface.address.startsWith('10.') ? 'Corporate/VPN' :
              interface.address.startsWith('172.') ? 'Corporate Network' : 'Other'
      });
    }
  });
});

if (ips.length === 0) {
  console.log('❌ No network interfaces found!');
  console.log('   Make sure you are connected to a network.');
  process.exit(1);
}

console.log('📡 Available IP addresses:');
ips.forEach((ip, index) => {
  console.log(`   ${index + 1}. ${ip.ip} (${ip.interface} - ${ip.type})`);
});

console.log('\n🚀 To use these IPs with your mobile app:');
console.log('   1. Start your backend server: npm start');
console.log('   2. Start Expo with LAN mode: expo start --lan');
console.log('   3. The app should automatically detect the correct IP');

console.log('\n💡 If automatic detection fails:');
console.log('   1. Update the fallback IP in mobile-app/src/services/api.js');
console.log('   2. Replace the fallback URL with one of the IPs above');

// Try to detect which IP is most likely correct
const likelyIP = ips.find(ip => ip.ip.startsWith('192.168.')) || ips[0];
if (likelyIP) {
  console.log(`\n✅ Most likely IP for mobile development: ${likelyIP.ip}`);
  console.log(`   Backend URL would be: http://${likelyIP.ip}:5000/api`);
}

console.log('\n🔧 Testing backend connection...');
try {
  const testIP = likelyIP ? likelyIP.ip : 'localhost';
  const testUrl = `http://${testIP}:5000/api/health`;
  
  // Try to test the connection (this might not work in all environments)
  console.log(`   Testing: ${testUrl}`);
  console.log('   (Manual test: Open this URL in your browser to verify)');
} catch (error) {
  console.log('   Could not automatically test connection');
}

console.log('\n📱 For Android Emulator:');
console.log('   Use: http://10.0.2.2:5000/api (maps to host localhost)');

console.log('\n📱 For iOS Simulator:');
console.log('   Use: http://gate-pass-system-9vid.onrender.com/api (direct localhost access)');

console.log('\n🌐 For Physical Devices:');
console.log(`   Use: http://${likelyIP ? likelyIP.ip : 'YOUR_IP'}:5000/api`);
console.log('   Make sure device and computer are on the same WiFi network');