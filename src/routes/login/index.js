import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ToastAndroid, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import debounce from 'lodash/debounce';

import { storeData } from '../../utilis';

const LoginScreen = ({navigation, onLogin}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [loader, setLoader] = useState(false);
 
  useEffect(() => {
    const validateEmail = debounce(() => {
      const isValidEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(username);
      setIsValidEmail(isValidEmail);
    }, 500); // Debounce time in milliseconds

    validateEmail();
    return validateEmail.cancel;
  }, [username]);

  useEffect(() => {
    const validatePassword = debounce(() => {
      const isValidPassword = password !== '';
      setIsValidPassword(isValidPassword);
    }, 500); // Debounce time in milliseconds

    validatePassword();
    return validatePassword.cancel;
  }, [password]);

  const handleEmailChange = (value) => {
    setUsername(value);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
  };

  const handleLogin = () => {
    setLoader(true);
    auth()
    .signInWithEmailAndPassword(username, password)
    .then(async (data) => {
      await storeData('login', 'true');
      await storeData('uid', data.user?.uid);
      await storeData('email', data.user?.email);
      const userdetail = {'uid': data.user?.uid, 'email': data.user?.email}
      console.log(userdetail);
      setLoader(false);
      onLogin(userdetail);
    })
    .catch(error => {
      setLoader(false);
      if (error.code === 'auth/email-already-in-use') {
        ToastAndroid.show('Email already logged in..', ToastAndroid.SHORT);
      }

      if (error.code === 'auth/invalid-email') {
        setIsValidEmail(false);
        setIsValidPassword(false);
        ToastAndroid.show('Invalid email or password', ToastAndroid.SHORT);
      }

      if (error.code === 'auth/user-not-found') {
        setIsValidEmail(false);
        setIsValidPassword(false);
        ToastAndroid.show('User not found', ToastAndroid.SHORT);
      }
      
      if (error.code === 'auth/wrong-password') {
        setIsValidPassword(false);
        storeData('login', 'false');
        ToastAndroid.show('Invalid password', ToastAndroid.SHORT);
      }

      console.log(error);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyCaptain</Text>
      <TextInput
        style={[styles.input, {borderColor: (!isValidEmail && username !== '') ? 'red': '#ccc'}]}
        placeholder="Email"
        value={username}
        keyboardType={'email-address'}
        textContentType={'emailAddress'}
        onChangeText={handleEmailChange}
      />
      <TextInput
        style={[styles.input, {borderColor: (!isValidPassword && password !== '') ? 'red': '#ccc'}]}
        placeholder="Password"
        value={password}
        textContentType={'password'}
        onChangeText={handlePasswordChange}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loader}>
        {loader ? <ActivityIndicator/> : <Text style={styles.buttonText}>Submit</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e2d2d',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '80%',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
