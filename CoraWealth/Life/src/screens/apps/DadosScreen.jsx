import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DadosScreen() {
  const [dado1, setDado1] = useState(1);
  const [dado2, setDado2] = useState(1);

  const tirarDados = () => {
    setDado1(Math.floor(Math.random() * 6) + 1);
    setDado2(Math.floor(Math.random() * 6) + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lanzar Dados</Text>
      <View style={styles.diceContainer}>
        <View style={styles.dice}><Text style={styles.diceText}>{dado1}</Text></View>
        <View style={styles.dice}><Text style={styles.diceText}>{dado2}</Text></View>
      </View>
      <TouchableOpacity style={styles.btn} onPress={tirarDados}>
        <Text style={styles.btnText}>Tirar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 30 },
  diceContainer: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  dice: { width: 100, height: 100, borderWidth: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#fff' },
  diceText: { fontSize: 40, fontWeight: 'bold' },
  btn: { backgroundColor: '#007BFF', padding: 15, borderRadius: 10 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});