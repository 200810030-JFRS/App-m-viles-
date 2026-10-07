import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Accelerometer } from 'expo-sensors';

// Obtenemos el tamaño de la pantalla para que la bolita no se salga
const { width, height } = Dimensions.get('window');
const TAMAÑO_BOLITA = 50;

export default function BolitaInclinacion() {
  // Empezamos con la bolita en el centro de la pantalla
  const [posicion, setPosicion] = useState({
    x: width / 2 - TAMAÑO_BOLITA / 2,
    y: height / 2 - TAMAÑO_BOLITA / 2,
  });

  useEffect(() => {
    // 16ms equivale a unos 60 cuadros por segundo para que se mueva fluido
    Accelerometer.setUpdateInterval(16);

    const suscripcion = Accelerometer.addListener(({ x, y }) => {
      setPosicion((posActual) => {
        // Multiplicamos por 15 para darle velocidad. 
        // Invertimos la 'y' porque en las pantallas el eje Y crece hacia abajo
        let nuevaX = posActual.x + x * 15;
        let nuevaY = posActual.y - y * 15;

        // Math.max y Math.min evitan que la bolita se salga de los bordes
        nuevaX = Math.max(0, Math.min(width - TAMAÑO_BOLITA, nuevaX));
        nuevaY = Math.max(0, Math.min(height - TAMAÑO_BOLITA, nuevaY));

        return { x: nuevaX, y: nuevaY };
      });
    });

    return () => suscripcion.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.textoFondo}>Inclina el teléfono</Text>
      
      {/* La bolita que se mueve */}
      <View
        style={[
          styles.bolita,
          { 
            left: posicion.x, 
            top: posicion.y 
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Un fondo oscuro
  },
  textoFondo: {
    color: '#444',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
  },
  bolita: {
    position: 'absolute', // Necesario para moverla libremente por la pantalla
    width: TAMAÑO_BOLITA,
    height: TAMAÑO_BOLITA,
    backgroundColor: '#00D1FF', // Color cian brillante
    borderRadius: TAMAÑO_BOLITA / 2, // La hace un círculo perfecto
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10, // Sombra tipo "neón" en Android
  },
});