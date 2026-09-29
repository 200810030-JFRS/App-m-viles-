import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import AppCard from '../components/AppCard';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppCard 
        title="Memorama" 
        icon="brain" 
        onPress={() => navigation.navigate('Memorama')} 
      />
      <AppCard 
        title="Calculadora IMC" 
        icon="weight" 
        onPress={() => navigation.navigate('IMC')} 
      />
      <AppCard 
        title="Divisas" 
        icon="currency-usd" 
        onPress={() => navigation.navigate('Divisas')} 
      />
      <AppCard 
        title="Par de Dados" 
        icon="dice-5" 
        onPress={() => navigation.navigate('Dados')} 
      />
      <AppCard 
        title="Tic Tac Toe" 
        icon="grid" 
        onPress={() => navigation.navigate('TicTacToe')} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 15 }
});