import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function ImcScreen() {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [resultado, setResultado] = useState(null);

  const calcularIMC = () => {
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    if (p && a) {
      const imc = p / (a * a);
      setResultado(imc.toFixed(2));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculadora de IMC</Text>
      <TextInput style={styles.input} placeholder="Peso (kg)" keyboardType="numeric" onChangeText={setPeso} />
      <TextInput style={styles.input} placeholder="Altura (m, ej: 1.75)" keyboardType="numeric" onChangeText={setAltura} />
      <Button title="Calcular" onPress={calcularIMC} />
      {resultado && <Text style={styles.result}>Tu IMC es: {resultado}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 20 },
  input: { width: '80%', borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 5 },
  result: { fontSize: 20, marginTop: 20, fontWeight: 'bold' }
});