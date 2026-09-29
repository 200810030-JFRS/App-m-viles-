import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ImcScreen from './src/screens/ImcScreen';
import CurrencyScreen from './src/screens/CurrencyScreen';
import TipScreen from './src/screens/TipScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Menu Principal' }} />
        <Stack.Screen name="IMC" component={ImcScreen} options={{ title: 'Calculadora IMC' }} />
        <Stack.Screen name="Currency" component={CurrencyScreen} options={{ title: 'Conversor Divisas' }} />
        <Stack.Screen name="Tip" component={TipScreen} options={{ title: 'Calculo Propina' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
