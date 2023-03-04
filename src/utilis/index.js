import AsyncStorage from '@react-native-async-storage/async-storage';

// To store data
export const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (e) {
    console.log(e)
  }
}

// To retrieve data
export const retrieveData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key)
    if (value !== null) {
      return value
    }
  } catch (e) {
    console.log(e)
  }
}
