import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Get the development server URL dynamically
 * This function tries multiple methods to detect the correct IP address
 */
export const getDevelopmentServerUrl = () => {
  if (!__DEV__) {
    // Production URL - replace with your actual production API URL
    return 'https://gate-pass-system-1.onrender.com/api';
  }

  // For web development
  if (Platform.OS === 'web') {
    return 'http://gate-pass-system-9vid.onrender.com/api';
  }

  console.log('🔍 Detecting development server URL...');
  
  // Method 1: Try to get from Expo Constants (most reliable)
  try {
    let hostUri = null;
    
    // Try different Expo SDK versions
    if (Constants.expoConfig?.hostUri) {
      hostUri = Constants.expoConfig.hostUri;
      console.log('📱 Found hostUri in expoConfig:', hostUri);
    } else if (Constants.manifest?.debuggerHost) {
      hostUri = Constants.manifest.debuggerHost;
      console.log('📱 Found debuggerHost in manifest:', hostUri);
    } else if (Constants.manifest?.hostUri) {
      hostUri = Constants.manifest.hostUri;
      console.log('📱 Found hostUri in manifest:', hostUri);
    } else if (Constants.manifest2?.extra?.expoClient?.hostUri) {
      hostUri = Constants.manifest2.extra.expoClient.hostUri;
      console.log('📱 Found hostUri in manifest2:', hostUri);
    }
    
    if (hostUri && typeof hostUri === 'string') {
      const host = hostUri.split(':')[0];
      const apiUrl = `http://${host}:5000/api`;
      console.log('✅ Using dynamic API URL:', apiUrl);
      return apiUrl;
    }
  } catch (error) {
    console.warn('⚠️ Could not get host URI from Expo Constants:', error);
  }

  // Method 2: Platform-specific fallbacks
  let fallbackUrl;
  
  if (Platform.OS === 'android') {
    // Android emulator maps host machine's localhost to 10.0.2.2
    fallbackUrl = 'http://10.0.2.2:5000/api';
    console.log('🤖 Using Android emulator fallback:', fallbackUrl);
  } else if (Platform.OS === 'ios') {
    // iOS simulator can access localhost directly
    fallbackUrl = 'http://gate-pass-system-9vid.onrender.com/api';
    console.log('🍎 Using iOS simulator fallback:', fallbackUrl);
  } else {
    // For physical devices, use the detected WiFi IP
    fallbackUrl = 'http://192.168.43.211:5000/api';
    console.log('📱 Using physical device fallback:', fallbackUrl);
  }

  // Show helpful instructions
  console.log('\n💡 To ensure automatic IP detection works:');
  console.log('   1. Start Expo with: expo start --lan');
  console.log('   2. Make sure your backend is running on port 5000');
  console.log('   3. Ensure your device/emulator is on the same network\n');

  return fallbackUrl;
};

/**
 * Test if the API URL is reachable
 */
export const testApiConnection = async (apiUrl) => {
  try {
    console.log('🔗 Testing API connection to:', apiUrl);
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    
    if (response.ok) {
      console.log('✅ API connection successful!');
      return true;
    } else {
      console.log('❌ API responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    return false;
  }
};

/**
 * Get API URL with connection testing
 */
export const getApiUrlWithTesting = async () => {
  const apiUrl = getDevelopmentServerUrl();
  
  // Test the connection in development
  if (__DEV__) {
    const isReachable = await testApiConnection(apiUrl);
    if (!isReachable) {
      console.log('\n⚠️ WARNING: Could not connect to backend server!');
      console.log('   Make sure your backend is running on the correct IP and port.');
      console.log('   Current API URL:', apiUrl);
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Check if backend server is running: npm start');
      console.log('   2. Verify the IP address is correct');
      console.log('   3. Check firewall settings');
      console.log('   4. Ensure device and server are on same network\n');
    }
  }
  
  return apiUrl;
};