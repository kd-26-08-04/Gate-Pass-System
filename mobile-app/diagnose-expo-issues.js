#!/usr/bin/env node

/**
 * Expo App Diagnostic Script
 * This script helps diagnose common issues preventing Expo apps from starting
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing Expo App Issues...\n');

// Check package.json dependencies
function checkDependencies() {
  console.log('📦 Checking package.json dependencies...');
  try {
    const packagePath = path.join(__dirname, 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredDeps = [
      'expo',
      'react',
      'react-native',
      '@react-navigation/native',
      '@react-navigation/native-stack',
      '@react-navigation/bottom-tabs',
      'react-native-paper',
      'axios',
      '@react-native-async-storage/async-storage'
    ];
    
    const missing = requiredDeps.filter(dep => !packageData.dependencies[dep]);
    
    if (missing.length > 0) {
      console.log('❌ Missing dependencies:', missing.join(', '));
      return false;
    } else {
      console.log('✅ All required dependencies found');
      return true;
    }
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
    return false;
  }
}

// Check for common file issues
function checkFiles() {
  console.log('\n📁 Checking critical files...');
  
  const criticalFiles = [
    'App.js',
    'src/context/AuthContext.js',
    'src/navigation/AuthNavigator.js',
    'src/navigation/AppNavigator.js',
    'src/navigation/StudentTabNavigator.js',
    'src/navigation/HODTabNavigator.js',
    'src/screens/auth/LoginScreen.js',
    'src/services/api.js'
  ];
  
  let allFilesExist = true;
  
  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Check App.js for StyleSheet import
function checkAppJs() {
  console.log('\n🔍 Checking App.js for StyleSheet import...');
  try {
    const appJsPath = path.join(__dirname, 'App.js');
    const content = fs.readFileSync(appJsPath, 'utf8');
    
    if (content.includes('StyleSheet.create') && !content.includes('import { StyleSheet }')) {
      console.log('❌ App.js uses StyleSheet but doesn\'t import it');
      return false;
    } else {
      console.log('✅ App.js StyleSheet import is correct');
      return true;
    }
  } catch (error) {
    console.log('❌ Error checking App.js:', error.message);
    return false;
  }
}

// Check expo version compatibility
function checkExpoVersion() {
  console.log('\n🔧 Checking Expo SDK version compatibility...');
  try {
    const packagePath = path.join(__dirname, 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const expoVersion = packageData.dependencies.expo;
    const reactVersion = packageData.dependencies.react;
    const reactNativeVersion = packageData.dependencies['react-native'];
    
    console.log(`📱 Expo SDK: ${expoVersion}`);
    console.log(`⚛️  React: ${reactVersion}`);
    console.log(`📱 React Native: ${reactNativeVersion}`);
    
    // Check for known compatibility issues
    if (expoVersion.includes('53.0.0') && reactVersion.includes('19.0.0')) {
      console.log('⚠️  Warning: React 19 with Expo SDK 53 may have compatibility issues');
      console.log('   Consider downgrading React to 18.x or upgrading Expo SDK');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error checking versions:', error.message);
    return false;
  }
}

// Main diagnostic function
function runDiagnostics() {
  const results = {
    dependencies: checkDependencies(),
    files: checkFiles(),
    appJs: checkAppJs(),
    versions: checkExpoVersion()
  };
  
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('====================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All diagnostics passed! Your app should work now.');
    console.log('💡 If you\'re still having issues, try:');
    console.log('   1. Clear Expo cache: expo r -c');
    console.log('   2. Restart Metro bundler');
    console.log('   3. Check network connection between device and development server');
  } else {
    console.log('\n⚠️  Some issues were found. Please fix them and run diagnostics again.');
    console.log('\n🔧 SUGGESTED FIXES:');
    
    if (!results.dependencies) {
      console.log('   • Run: npm install or yarn install');
    }
    
    if (!results.versions) {
      console.log('   • Consider updating React: npm install react@^18.2.0 react-dom@^18.2.0');
    }
    
    if (!results.appJs) {
      console.log('   • Add StyleSheet import to App.js');
    }
  }
}

// Run the diagnostics
runDiagnostics();