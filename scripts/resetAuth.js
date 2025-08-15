/**
 * Emergency Authentication Reset Script
 * Run this script to completely clear all authentication data
 * 
 * Usage: node scripts/resetAuth.js
 */

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function resetAllAuthData() {
  console.log('🚨 EMERGENCY AUTH RESET STARTING...');
  
  try {
    // Get all keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📋 Found keys:', allKeys);
    
    // Clear ALL keys (nuclear option)
    await AsyncStorage.clear();
    console.log('💥 Cleared all AsyncStorage data');
    
    console.log('✅ EMERGENCY RESET COMPLETE');
    console.log('🔄 Please restart your app now');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  resetAllAuthData();
}

module.exports = { resetAllAuthData };
