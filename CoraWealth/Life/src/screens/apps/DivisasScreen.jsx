import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function DivisasScreen() {
  const [mxn, setMxn] = useState('');
  const [usd, setUsd] = useState(null);
  const [eur, setEur] = useState(null);

  const convertir = () => {
    const pesos = parseFloat(mxn);
    if (pesos) {
      setUsd((pesos / 17.5).toFixed(2)); // Tasa de ejemplo
      setEur((pesos / 19.2).toFixed(2)); // Tasa de ejemplo
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversor de Divisas</Text>
      <TextInput style={styles.input} placeholder="Cantidad en MXN" keyboardType="numeric" onChangeText={setMxn} />
      <Button title="Convertir" onPress={convertir} />
      {usd && <Text style={styles.result}>USD: ${usd}</Text>}
      {eur && <Text style={styles.result}>EUR: €{eur}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 20 },
  input: { width: '80%', borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 5 },
  result: { fontSize: 20, marginTop: 10, fontWeight: 'bold' }
});