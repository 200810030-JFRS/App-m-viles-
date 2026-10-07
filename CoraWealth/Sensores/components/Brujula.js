import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Magnetometer } from 'expo-sensors';

export default function Brujula() {
  const [datos, setDatos] = useState({ x: 0, y: 0, z: 0 });
  const [angulo, setAngulo] = useState(0);

  useEffect(() => {
    Magnetometer.setUpdateInterval(100);

    const suscripcion = Magnetometer.addListener((mediciones) => {
      setDatos(mediciones);
      const { x, y } = mediciones;

      // EL FIX: Restamos 90 grados para alinear el Norte (0°) con la parte superior del teléfono
      let anguloCalculado = Math.atan2(y, x) * (180 / Math.PI) - 90;

      // Si el ángulo es negativo, le sumamos 360 para mantenerlo en el formato 0-360°
      if (anguloCalculado < 0) {
        anguloCalculado += 360;
      }

      setAngulo(anguloCalculado);
    });

    return () => suscripcion.remove();
  }, []);

  // Función para calcular el punto cardinal basado en los grados
  const obtenerPuntoCardinal = (grados) => {
    if (grados >= 337.5 || grados < 22.5) return 'N';
    if (grados >= 22.5 && grados < 67.5) return 'NE';
    if (grados >= 67.5 && grados < 112.5) return 'E';
    if (grados >= 112.5 && grados < 157.5) return 'SE';
    if (grados >= 157.5 && grados < 202.5) return 'S';
    if (grados >= 202.5 && grados < 247.5) return 'SO'; // SurOeste
    if (grados >= 247.5 && grados < 292.5) return 'O';  // Oeste (O)
    if (grados >= 292.5 && grados < 337.5) return 'NO';
    return '';
  };

  const rotacionBrujula = `${360 - angulo}deg`;
  const puntoCardinal = obtenerPuntoCardinal(angulo);

  return (
    <View style={styles.container}>
      {/* Texto principal estilo app nativa (ej. "O 270°") */}
      <Text style={styles.gradosPrincipales}>
        {puntoCardinal} {Math.round(angulo)}°
      </Text>

      <View style={styles.brujulaContainer}>
        <View style={[styles.circuloBrujula, { transform: [{ rotate: rotacionBrujula }] }]}>
          <View style={styles.nortePuntero}>
            <Text style={styles.letraPuntero}>N</Text>
          </View>
        </View>
      </View>

      {/* Tus tarjetas originales para depurar */}
      <View style={styles.datosContainer}>
        <View style={styles.card}>
          <Text style={styles.axis}>X:</Text>
          <Text style={styles.value}>{datos.x.toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.axis}>Y:</Text>
          <Text style={styles.value}>{datos.y.toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.axis}>Z:</Text>
          <Text style={styles.value}>{datos.z.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#000000', // Lo cambié a negro para que parezca más la brújula de tu captura
  },
  gradosPrincipales: {
    fontSize: 48,
    fontWeight: '300', // Un poco más delgado para verse elegante
    color: '#fff',
    marginBottom: 50,
  },
  brujulaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  circuloBrujula: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: '#444', // Borde sutil
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#111',
  },
  nortePuntero: {
    marginTop: 10,
    alignItems: 'center',
  },
  letraPuntero: {
    color: '#dc1212',
    fontSize: 28,
    fontWeight: 'bold',
  },
  datosContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: '#1c1c1c', // Tarjetas oscuras
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axis: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6c757d",
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});