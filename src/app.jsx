import React,{useEffect, useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from "@react-native-firebase/app";

import AppNavigator from './navigation/index';
import LoginScreen from './routes/login';

export const MyContext = React.createContext();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyD86iKEJWyk-tq-owcyjq_SbVCmmZ-GQ4Q",
      authDomain: "captain-5231e.firebaseapp.com",
      projectId: "captain-5231e",
      databaseURL: "https://captain-5231e.firebaseio.com",
      storageBucket: "captain-5231e.appspot.com",
      messagingSenderId: "518117813249",
      appId: "1:518117813249:web:56828f04f7886b289d6400"
    };
    firebase.initializeApp(firebaseConfig);
  }, [])

  useEffect(() => {
    const retrieveData = async () => {
      try {
        const token = await AsyncStorage.getItem('login');
        if (token === 'true') {
          const uid = await AsyncStorage.getItem('uid');
          const email = await AsyncStorage.getItem('email');
          const userdetail = {'uid': uid, 'email': email};
          setUserDetails(userdetail);
          if (uid && email) {
            setIsLoggedIn(true);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.log(error);
        setIsLoggedIn(false);
      }
    };

    retrieveData();
  }, []);

  const logoutPress = () => {
    setIsLoggedIn(false);
    setUserDetails({});
  }
  
  return (
    <NavigationContainer>
      {isLoggedIn ?
        <MyContext.Provider value={{ isLoggedIn, logoutPress }}>
          <AppNavigator userDetails={userDetails}/>
        </MyContext.Provider> : 
        <LoginScreen onLogin={(val) => {
          console.log(val);
          setUserDetails(val);
          setIsLoggedIn(true);
        }}/>
      }
    </NavigationContainer>
  );
}

export default App;