import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Accelerometer } from "expo-sensors";

// ==========================================
// SPLASH SCREEN
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
        👟
      </Animated.Text>

      <Text style={styles.splashTitulo}>
        PODÓMETRO
      </Text>

      <Text style={styles.splashSubtitulo}>
        Acelerómetro Edition
      </Text>
    </View>
  );
}

// ==========================================
// COMPONENTE DEL ACELERÓMETRO
// ==========================================

function Acelerometro({ datos }) {
  return (
    <View style={styles.sensorContainer}>

      <Text style={styles.sensorTitulo}>
        📱 ACELERÓMETRO
      </Text>

      <View style={styles.sensorFila}>

        <View style={styles.sensorDato}>
          <Text style={styles.sensorEje}>
            X
          </Text>

          <Text style={styles.sensorValor}>
            {datos.x.toFixed(2)}
          </Text>
        </View>

        <View style={styles.sensorDato}>
          <Text style={styles.sensorEje}>
            Y
          </Text>

          <Text style={styles.sensorValor}>
            {datos.y.toFixed(2)}
          </Text>
        </View>

        <View style={styles.sensorDato}>
          <Text style={styles.sensorEje}>
            Z
          </Text>

          <Text style={styles.sensorValor}>
            {datos.z.toFixed(2)}
          </Text>
        </View>

      </View>

      <Text style={styles.sensorAyuda}>
        🚶 Camina o mueve el teléfono para detectar pasos
      </Text>

    </View>
  );
}

// ==========================================
// COMPONENTE CONTADOR DE PASOS
// ==========================================

function ContadorPasos({ pasos }) {

  return (
    <View style={styles.pasosContainer}>

      <Text style={styles.pasosIcono}>
        👣
      </Text>

      <Text style={styles.pasosNumero}>
        {pasos}
      </Text>

      <Text style={styles.pasosTexto}>
        PASOS
      </Text>

    </View>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

function PodometroScreen() {

  const [datos, setDatos] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [pasos, setPasos] = useState(0);

  const [activo, setActivo] = useState(true);

  // Última magnitud del acelerómetro
  const ultimoMovimiento = useRef(0);

  // Tiempo del último paso
  const ultimoPaso = useRef(0);

  // Suscripción del sensor
  const suscripcionRef = useRef(null);

  // ========================================
  // DETECTAR PASOS
  // ========================================

  const iniciarSensor = () => {

    Accelerometer.setUpdateInterval(100);

    suscripcionRef.current =
      Accelerometer.addListener((mediciones) => {

        // Guardar valores X Y Z
        setDatos({
          x: mediciones.x,
          y: mediciones.y,
          z: mediciones.z,
        });

        // ==================================
        // CALCULAR MAGNITUD
        // ==================================

        const magnitud = Math.sqrt(
          mediciones.x * mediciones.x +
          mediciones.y * mediciones.y +
          mediciones.z * mediciones.z
        );

        // Diferencia respecto al valor normal
        const movimiento = Math.abs(
          magnitud - ultimoMovimiento.current
        );

        ultimoMovimiento.current = magnitud;

        const ahora = Date.now();

        // ==================================
        // DETECTAR PASO
        // ==================================

        if (
          movimiento > 0.18 &&
          ahora - ultimoPaso.current > 400
        ) {

          ultimoPaso.current = ahora;

          setPasos((valor) => valor + 1);
        }
      });

    setActivo(true);
  };

  // ========================================
  // CONFIGURAR SENSOR AL INICIAR
  // ========================================

  useEffect(() => {

    iniciarSensor();

    return () => {

      if (suscripcionRef.current) {
        suscripcionRef.current.remove();
      }

    };

  }, []);

  // ========================================
  // ACTIVAR / DESACTIVAR SENSOR
  // ========================================

  const cambiarSensor = () => {

    if (activo) {

      if (suscripcionRef.current) {
        suscripcionRef.current.remove();
        suscripcionRef.current = null;
      }

      setActivo(false);

    } else {

      iniciarSensor();

    }
  };

  // ========================================
  // REINICIAR PASOS
  // ========================================

  const reiniciarPasos = () => {

    setPasos(0);

    ultimoMovimiento.current = 0;

    ultimoPaso.current = 0;

    Alert.alert(
      "🔄 Podómetro reiniciado",
      "El contador de pasos volvió a cero."
    );
  };

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <View style={styles.container}>

      {/* TÍTULO */}

      <Text style={styles.titulo}>
        👟 PODÓMETRO
      </Text>

      <Text style={styles.subtitulo}>
        Contador de pasos con acelerómetro
      </Text>

      {/* CONTADOR */}

      <ContadorPasos pasos={pasos} />

      {/* INFORMACIÓN */}

      <View style={styles.infoContainer}>

        <View style={styles.infoDato}>

          <Text style={styles.infoNumero}>
            {pasos}
          </Text>

          <Text style={styles.infoTexto}>
            Pasos
          </Text>

        </View>

        <View style={styles.infoDato}>

          <Text style={styles.infoNumero}>
            {(pasos * 0.0007).toFixed(2)}
          </Text>

          <Text style={styles.infoTexto}>
            km aprox.
          </Text>

        </View>

        <View style={styles.infoDato}>

          <Text style={styles.infoNumero}>
            {pasos * 0.04}
          </Text>

          <Text style={styles.infoTexto}>
            kcal aprox.
          </Text>

        </View>

      </View>

      {/* SENSOR */}

      <Acelerometro datos={datos} />

      {/* BOTÓN SENSOR */}

      <TouchableOpacity
        style={[
          styles.boton,
          !activo && styles.botonActivar,
        ]}
        onPress={cambiarSensor}
      >

        <Text style={styles.botonTexto}>

          {activo
            ? "⏹ Detener sensor"
            : "▶ Activar sensor"}

        </Text>

      </TouchableOpacity>

      {/* BOTÓN REINICIAR */}

      <TouchableOpacity
        style={styles.botonReiniciar}
        onPress={reiniciarPasos}
      >

        <Text style={styles.botonReiniciarTexto}>
          🔄 Reiniciar pasos
        </Text>

      </TouchableOpacity>

      {/* INFORMACIÓN */}

      <Text style={styles.info}>

        El acelerómetro detecta los movimientos
        del teléfono para estimar la cantidad de pasos.

      </Text>

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

  return <PodometroScreen />;
}

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({

  // ========================================
  // SPLASH SCREEN
  // ========================================

  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#166534",
  },

  logo: {
    fontSize: 100,
    marginBottom: 20,
  },

  splashTitulo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ffffff",
  },

  splashSubtitulo: {
    fontSize: 18,
    color: "#dcfce7",
    marginTop: 8,
  },

  // ========================================
  // CONTENEDOR
  // ========================================

  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    padding: 20,
    paddingTop: 55,
    alignItems: "center",
  },

  titulo: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#14532d",
    textAlign: "center",
  },

  subtitulo: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 5,
    marginBottom: 20,
    textAlign: "center",
  },

  // ========================================
  // CONTADOR
  // ========================================

  pasosContainer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#ffffff",
    borderWidth: 8,
    borderColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 20,
  },

  pasosIcono: {
    fontSize: 45,
  },

  pasosNumero: {
    fontSize: 55,
    fontWeight: "bold",
    color: "#166534",
  },

  pasosTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748b",
    letterSpacing: 2,
  },

  // ========================================
  // INFORMACIÓN
  // ========================================

  infoContainer: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    elevation: 4,
  },

  infoDato: {
    alignItems: "center",
  },

  infoNumero: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#166534",
  },

  infoTexto: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 3,
  },

  // ========================================
  // ACELERÓMETRO
  // ========================================

  sensorContainer: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 15,
    elevation: 5,
  },

  sensorTitulo: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 12,
  },

  sensorFila: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  sensorDato: {
    alignItems: "center",
  },

  sensorEje: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#64748b",
  },

  sensorValor: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },

  sensorAyuda: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 12,
    marginTop: 10,
  },

  // ========================================
  // BOTÓN
  // ========================================

  boton: {
    width: "100%",
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
    alignItems: "center",
  },

  botonActivar: {
    backgroundColor: "#22c55e",
  },

  botonTexto: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },

  // ========================================
  // BOTÓN REINICIAR
  // ========================================

  botonReiniciar: {
    width: "100%",
    backgroundColor: "#166534",
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    alignItems: "center",
  },

  botonReiniciarTexto: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },

  // ========================================
  // TEXTO INFORMACIÓN
  // ========================================

  info: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 12,
    marginTop: 12,
    paddingHorizontal: 15,
  },

});