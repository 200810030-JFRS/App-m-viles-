import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { Gyroscope } from "expo-sensors";

// ==========================================
// DATOS DEL MEMORAMA
// ==========================================

const EMOJIS = ["🐶", "🐱", "🦊", "🐼", "🐸", "🐵"];

// Crear las parejas
const crearCartas = () => {
  const cartas = [...EMOJIS, ...EMOJIS];

  return cartas
    .map((valor, index) => ({
      id: index,
      valor,
      volteada: false,
      encontrada: false,
    }))
    .sort(() => Math.random() - 0.5);
};

// ==========================================
// COMPONENTE SPLASH SCREEN
// ==========================================

function SplashScreen({ terminar }) {
  const escala = useRef(new Animated.Value(0.5)).current;
  const opacidad = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(escala, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacidad, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    const tiempo = setTimeout(() => {
      terminar();
    }, 2000);

    return () => clearTimeout(tiempo);
  }, []);

  return (
    <View style={styles.splash}>
      <Animated.Text
        style={[
          styles.logo,
          {
            transform: [{ scale: escala }],
            opacity: opacidad,
          },
        ]}
      >
        🧠
      </Animated.Text>

      <Text style={styles.splashTitulo}>MEMORAMA</Text>
      <Text style={styles.splashSubtitulo}>Giroscopio Edition</Text>
    </View>
  );
}

// ==========================================
// COMPONENTE DE CARTA
// ==========================================

function Carta({ carta, presionar }) {
  return (
    <TouchableOpacity
      style={[
        styles.carta,
        carta.encontrada && styles.cartaEncontrada,
      ]}
      onPress={() => presionar(carta.id)}
      disabled={carta.encontrada}
    >
      {carta.volteada || carta.encontrada ? (
        <Text style={styles.emoji}>{carta.valor}</Text>
      ) : (
        <Text style={styles.interrogacion}>?</Text>
      )}
    </TouchableOpacity>
  );
}

// ==========================================
// COMPONENTE GIROSCOPIO
// ==========================================

function Giroscopio({ datos }) {
  return (
    <View style={styles.sensorContainer}>
      <Text style={styles.sensorTitulo}>📱 GIROSCOPIO</Text>

      <View style={styles.sensorFila}>
        <View style={styles.sensorDato}>
          <Text style={styles.sensorEje}>X</Text>
          <Text style={styles.sensorValor}>
            {datos.x.toFixed(2)}
          </Text>
        </View>

        <View style={styles.sensorDato}>
          <Text style={styles.sensorEje}>Y</Text>
          <Text style={styles.sensorValor}>
            {datos.y.toFixed(2)}
          </Text>
        </View>

        <View style={styles.sensorDato}>
          <Text style={styles.sensorEje}>Z</Text>
          <Text style={styles.sensorValor}>
            {datos.z.toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={styles.sensorAyuda}>
        🔄 Gira tu teléfono para mezclar las cartas
      </Text>
    </View>
  );
}

// ==========================================
// COMPONENTE MEMORAMA
// ==========================================

function MemoramaScreen() {
  const [cartas, setCartas] = useState(crearCartas);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [movimientos, setMovimientos] = useState(0);

  const [datos, setDatos] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const ultimaRotacion = useRef(0);

  // ========================================
  // CONFIGURAR GIROSCOPIO
  // ========================================

  useEffect(() => {
    Gyroscope.setUpdateInterval(100);

    const suscripcion = Gyroscope.addListener((mediciones) => {
      setDatos({
        x: mediciones.x,
        y: mediciones.y,
        z: mediciones.z,
      });

      // Magnitud de la rotación
      const rotacion = Math.sqrt(
        mediciones.x * mediciones.x +
          mediciones.y * mediciones.y +
          mediciones.z * mediciones.z
      );

      const ahora = Date.now();

      // Detectar giro fuerte
      if (
        rotacion > 4 &&
        ahora - ultimaRotacion.current > 2000
      ) {
        ultimaRotacion.current = ahora;

        mezclarCartas();

        Alert.alert(
          "🔄 ¡Giro detectado!",
          "Las cartas se mezclaron nuevamente."
        );
      }
    });

    return () => {
      suscripcion.remove();
    };
  }, []);

  // ========================================
  // MEZCLAR CARTAS
  // ========================================

  const mezclarCartas = () => {
    setCartas(crearCartas);
    setSeleccionadas([]);
    setMovimientos(0);
  };

  // ========================================
  // PRESIONAR CARTA
  // ========================================

  const presionarCarta = (id) => {
    if (seleccionadas.length === 2) {
      return;
    }

    const carta = cartas.find((c) => c.id === id);

    if (!carta || carta.volteada || carta.encontrada) {
      return;
    }

    const nuevasCartas = cartas.map((c) =>
      c.id === id
        ? { ...c, volteada: true }
        : c
    );

    setCartas(nuevasCartas);

    const nuevasSeleccionadas = [
      ...seleccionadas,
      id,
    ];

    setSeleccionadas(nuevasSeleccionadas);

    // Primera carta
    if (nuevasSeleccionadas.length === 1) {
      return;
    }

    // Segunda carta
    setMovimientos((valor) => valor + 1);

    const carta1 = nuevasCartas.find(
      (c) => c.id === nuevasSeleccionadas[0]
    );

    const carta2 = nuevasCartas.find(
      (c) => c.id === nuevasSeleccionadas[1]
    );

    // Si son pareja
    if (carta1.valor === carta2.valor) {
      setTimeout(() => {
        setCartas((actuales) =>
          actuales.map((c) =>
            c.id === carta1.id ||
            c.id === carta2.id
              ? {
                  ...c,
                  encontrada: true,
                  volteada: true,
                }
              : c
          )
        );

        setSeleccionadas([]);

      }, 500);
    } else {
      // Si no son pareja
      setTimeout(() => {
        setCartas((actuales) =>
          actuales.map((c) =>
            c.id === carta1.id ||
            c.id === carta2.id
              ? {
                  ...c,
                  volteada: false,
                }
              : c
          )
        );

        setSeleccionadas([]);

      }, 1000);
    }
  };

  // ========================================
  // COMPROBAR VICTORIA
  // ========================================

  useEffect(() => {
    if (
      cartas.length > 0 &&
      cartas.every((c) => c.encontrada)
    ) {
      setTimeout(() => {
        Alert.alert(
          "🎉 ¡Felicidades!",
          `Completaste el Memorama en ${movimientos} movimientos.`,
          [
            {
              text: "Jugar nuevamente",
              onPress: mezclarCartas,
            },
          ]
        );
      }, 500);
    }
  }, [cartas]);

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        🧠 MEMORAMA
      </Text>

      <Text style={styles.movimientos}>
        Movimientos: {movimientos}
      </Text>

      <Giroscopio datos={datos} />

      <View style={styles.tablero}>
        {cartas.map((carta) => (
          <Carta
            key={carta.id}
            carta={carta}
            presionar={presionarCarta}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.boton}
        onPress={mezclarCartas}
      >
        <Text style={styles.botonTexto}>
          🔄 Reiniciar juego
        </Text>
      </TouchableOpacity>

    </View>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function App() {
  const [mostrarSplash, setMostrarSplash] =
    useState(true);

  if (mostrarSplash) {
    return (
      <SplashScreen
        terminar={() => setMostrarSplash(false)}
      />
    );
  }

  return <MemoramaScreen />;
}

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2563eb",
  },

  logo: {
    fontSize: 90,
    marginBottom: 20,
  },

  splashTitulo: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#fff",
  },

  splashSubtitulo: {
    fontSize: 18,
    color: "#dbeafe",
    marginTop: 8,
  },

  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 20,
    paddingTop: 50,
  },

  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a8a",
  },

  movimientos: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 5,
    marginBottom: 15,
    color: "#475569",
  },

  // ========================================
  // SENSOR
  // ========================================

  sensorContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
  },

  sensorTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2563eb",
    marginBottom: 10,
  },

  sensorFila: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  sensorDato: {
    alignItems: "center",
  },

  sensorEje: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#64748b",
  },

  sensorValor: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },

  sensorAyuda: {
    textAlign: "center",
    marginTop: 10,
    color: "#64748b",
    fontSize: 13,
  },

  // ========================================
  // TABLERO
  // ========================================

  tablero: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  carta: {
    width: "28%",
    aspectRatio: 0.85,
    margin: "2%",
    backgroundColor: "#2563eb",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  cartaEncontrada: {
    backgroundColor: "#22c55e",
  },

  interrogacion: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ffffff",
  },

  emoji: {
    fontSize: 40,
  },

  // ========================================
  // BOTÓN
  // ========================================

  boton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
    alignItems: "center",
  },

  botonTexto: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});