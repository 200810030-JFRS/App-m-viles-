import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';

const emojis = ['🚀', '💻', '🎮', '🎧', '🚀', '💻', '🎮', '🎧'];

export default function MemoramaScreen() {
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    iniciarJuego();
  }, []);

  const iniciarJuego = () => {
    const shuffled = emojis.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelected([]);
    setMatches([]);
  };

  const handlePress = (index) => {
    if (selected.length === 2 || selected.includes(index) || matches.includes(index)) return;
    
    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      if (cards[newSelected[0]] === cards[newSelected[1]]) {
        setMatches([...matches, newSelected[0], newSelected[1]]);
      }
      setTimeout(() => setSelected([]), 1000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memorama</Text>
      <View style={styles.grid}>
        {cards.map((emoji, index) => {
          const isFlipped = selected.includes(index) || matches.includes(index);
          return (
            <TouchableOpacity key={index} style={[styles.card, isFlipped && styles.cardFlipped]} onPress={() => handlePress(index)}>
              <Text style={styles.cardText}>{isFlipped ? emoji : '❓'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Button title="Reiniciar" onPress={iniciarJuego} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 320, justifyContent: 'center', gap: 10, marginBottom: 20 },
  card: { width: 70, height: 90, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  cardFlipped: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#007BFF' },
  cardText: { fontSize: 32 }
});