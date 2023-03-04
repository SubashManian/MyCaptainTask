import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Animated, TouchableWithoutFeedback } from 'react-native';

const FloatingButton = ({addPress, searchPress}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const buttonSize = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 200],
  });

  const menuItems = [
    { text: 'Search', onPress: () => {
        toggleMenu();
        searchPress();
    }},
    { text: 'Add', onPress: () => {
        toggleMenu();
        addPress();
    }},
  ];

  const buttonStyle = {
    transform: [
      {
        scale: buttonSize.interpolate({
          inputRange: [56, 200],
          outputRange: [1, 1.2],
        }),
      },
    ],
  };

  const menuStyle = {
    opacity: animation,
    transform: [
      {
        translateY: buttonSize.interpolate({
          inputRange: [56, 200],
          outputRange: [-40, -10],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableWithoutFeedback key={index} onPress={item.onPress}>
          <Animated.View style={[styles.menuItem, menuStyle]}>
            <Text>{item.text}</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      ))}
      <TouchableWithoutFeedback onPress={toggleMenu}>
        <Animated.View style={[styles.button, buttonStyle]}>
          <Text style={styles.buttonText}>{isMenuOpen ? 'x' : '+'}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 32,
  },
  button: {
    backgroundColor: 'orange',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  menuItem: {
    backgroundColor: '#0246b3',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});

export default FloatingButton;
