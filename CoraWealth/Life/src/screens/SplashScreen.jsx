import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2500, // Aumentado a 2.5 segundos para la animación
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 30,
        useNativeDriver: true,
      })
    ]).start(() => {
      // 3000 = 3 SEGUNDOS de espera adicionales antes de quitar el Splash
      setTimeout(() => {
        navigation.replace('MainApp'); 
      }, 3000); 
    });
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animationWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.treeIcon}>🌳</Text>
        <Text style={styles.logoText}>LIFE</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9', // Verde muy clarito y relajante
  },
  animationWrapper: {
    alignItems: 'center',
  },
  treeIcon: {
    fontSize: 90,
    marginBottom: -10, // Acerca el árbol al texto
  },
  logoText: {
    fontSize: 65,
    fontWeight: '900',
    color: '#2E7D32', // Verde bosque oscuro
    letterSpacing: 12,
    textShadowColor: 'rgba(46, 125, 50, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  }
});