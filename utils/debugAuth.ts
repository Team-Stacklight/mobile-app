import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug utility to manually clear all authentication data
 * Use this if you're experiencing loading loops or authentication issues
 */
export const clearAllAuthenticationData = async () => {
  console.log('🧹 Clearing all authentication data...');
  
  try {
    // Get all keys from AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📋 All AsyncStorage keys:', allKeys);
    
    // Keys that might contain authentication data
    const authKeys = [
      'auth_token',
      'firebase:authUser:AIzaSyC8K9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X:[DEFAULT]',
      'firebase:host:auth-localhost',
      '@firebase/auth:user',
      '@firebase/auth:token',
      'userToken',
      'user',
      'firebaseUser',
      'authUser',
      '@react-native-firebase/auth',
      'firebase:user',
      'firebase:token'
    ];
    
    // Remove all potential auth keys
    const keysToRemove = allKeys.filter(key => 
      authKeys.some(authKey => key.includes(authKey)) ||
      key.includes('firebase') ||
      key.includes('auth') ||
      key.includes('user') ||
      key.includes('token')
    );
    
    console.log('🗑️ Removing keys:', keysToRemove);
    
    await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
    
    console.log('✅ Successfully cleared all authentication data');
    console.log('🔄 Please restart the app to see the changes');
    
    return {
      success: true,
      removedKeys: keysToRemove,
      message: 'All authentication data cleared successfully'
    };
    
  } catch (error) {
    console.error('❌ Error clearing authentication data:', error);
    return {
      success: false,
      error: error,
      message: 'Failed to clear authentication data'
    };
  }
};

/**
 * Debug utility to inspect current AsyncStorage contents
 */
export const inspectAsyncStorage = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const allData: Record<string, string | null> = {};
    
    for (const key of allKeys) {
      try {
        allData[key] = await AsyncStorage.getItem(key);
      } catch (error) {
        allData[key] = `Error reading key: ${error}`;
      }
    }
    
    console.log('🔍 Current AsyncStorage contents:', allData);
    return allData;
  } catch (error) {
    console.error('❌ Error inspecting AsyncStorage:', error);
    return null;
  }
};
