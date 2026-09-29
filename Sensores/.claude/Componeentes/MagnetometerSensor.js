import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Magnetometer } from "expo-sensors";

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
        🧭
      </Animated.Text>

      <Text style={styles.splashTitulo}>BRÚJULA</Text>

      <Text style={styles.splashSubtitulo}>
        Magnetómetro Edition
      </Text>
    </View>
  );
}

// ==========================================
// COMPONENTE DEL MAGNETÓMETRO
// ==========================================

function Magnetometro({ datos }) {
  return (
    <View style={styles.sensorContainer}>
      <Text style={styles.sensorTitulo}>
        🧲 MAGNETÓMETRO
      </Text>

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
        📱 Mueve tu teléfono para cambiar la dirección
      </Text>
    </View>
  );
}

// ==========================================
// COMPONENTE BRÚJULA
// ==========================================

function Brujula({ grados }) {
  const rotacion = `${grados}deg`;

  return (
    <View style={styles.brujulaContainer}>

      <View style={styles.brujula}>

        {/* NORTE */}
        <Text style={[styles.direccion, styles.norte]}>
          N
        </Text>

        {/* ESTE */}
        <Text style={[styles.direccion, styles.este]}>
          E
        </Text>

        {/* SUR */}
        <Text style={[styles.direccion, styles.sur]}>
          S
        </Text>

        {/* OESTE */}
        <Text style={[styles.direccion, styles.oeste]}>
          O
        </Text>

        {/* AGUJA */}
        <Animated.View
          style={[
            styles.aguja,
            {
              transform: [
                {
                  rotate: rotacion,
                },
              ],
            },
          ]}
        >
          <View style={styles.agujaNorte} />

          <View style={styles.agujaSur} />
        </Animated.View>

        {/* CENTRO */}
        <View style={styles.centro}>
          <Text style={styles.centroTexto}>
            +
          </Text>
        </View>

      </View>

      <Text style={styles.grados}>
        {grados.toFixed(0)}°
      </Text>

      <Text style={styles.direccionTexto}>
        {obtenerDireccion(grados)}
      </Text>

    </View>
  );
}

// ==========================================
// OBTENER DIRECCIÓN
// ==========================================

function obtenerDireccion(grados) {

  if (grados >= 337.5 || grados < 22.5) {
    return "Norte";
  }

  if (grados >= 22.5 && grados < 67.5) {
    return "Noreste";
  }

  if (grados >= 67.5 && grados < 112.5) {
    return "Este";
  }

  if (grados >= 112.5 && grados < 157.5) {
    return "Sureste";
  }

  if (grados >= 157.5 && grados < 202.5) {
    return "Sur";
  }

  if (grados >= 202.5 && grados < 247.5) {
    return "Suroeste";
  }

  if (grados >= 247.5 && grados < 292.5) {
    return "Oeste";
  }

  return "Noroeste";
}

// ==========================================
// PANTALLA PRINCIPAL
// ==========================================

function BrujulaScreen() {

  const [datos, setDatos] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [grados, setGrados] = useState(0);

  const [activo, setActivo] = useState(true);

  // ========================================
  // CONFIGURAR MAGNETÓMETRO
  // ========================================

  useEffect(() => {

    Magnetometer.setUpdateInterval(100);

    const suscripcion = Magnetometer.addListener(
      (mediciones) => {

        setDatos({
          x: mediciones.x,
          y: mediciones.y,
          z: mediciones.z,
        });

        // ==================================
        // CALCULAR ORIENTACIÓN
        // ==================================

        let angulo = Math.atan2(
          mediciones.y,
          mediciones.x
        );

        angulo = angulo * (180 / Math.PI);

        // Convertir a grados 0 - 360
        angulo = angulo + 90;

        if (angulo < 0) {
          angulo += 360;
        }

        if (angulo >= 360) {
          angulo -= 360;
        }

        setGrados(angulo);
      }
    );

    return () => {
      suscripcion.remove();
    };

  }, []);

  // ========================================
  // ACTIVAR / DESACTIVAR SENSOR
  // ========================================

  const cambiarSensor = () => {

    if (activo) {

      Magnetometer.removeAllListeners();

      setActivo(false);

    } else {

      Magnetometer.setUpdateInterval(100);

      const suscripcion =
        Magnetometer.addListener((mediciones) => {

          setDatos({
            x: mediciones.x,
            y: mediciones.y,
            z: mediciones.z,
          });

          let angulo = Math.atan2(
            mediciones.y,
            mediciones.x
          );

          angulo = angulo * (180 / Math.PI);

          angulo = angulo + 90;

          if (angulo < 0) {
            angulo += 360;
          }

          if (angulo >= 360) {
            angulo -= 360;
          }

          setGrados(angulo);
        });

      setActivo(true);
    }
  };

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        🧭 BRÚJULA
      </Text>

      <Text style={styles.subtitulo}>
        Brújula digital con magnetómetro
      </Text>

      {/* BRÚJULA */}

      <Brujula grados={grados} />

      {/* SENSOR */}

      <Magnetometro datos={datos} />

      {/* BOTÓN */}

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

      <Text style={styles.info}>
        El magnetómetro detecta el campo magnético
        de la Tierra para calcular la orientación.
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

  return <BrujulaScreen />;
}

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({

  // ========================================
  // SPLASH
  // ========================================

  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
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
    color: "#cbd5e1",
    marginTop: 8,
  },

  // ========================================
  // CONTENEDOR
  // ========================================

  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 20,
    paddingTop: 55,
    alignItems: "center",
  },

  titulo: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
  },

  subtitulo: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 5,
    marginBottom: 20,
  },

  // ========================================
  // BRÚJULA
  // ========================================

  brujulaContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  brujula: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#ffffff",
    borderWidth: 8,
    borderColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  direccion: {
    position: "absolute",
    fontSize: 30,
    fontWeight: "bold",
    color: "#1e293b",
  },

  norte: {
    top: 12,
  },

  este: {
    right: 18,
  },

  sur: {
    bottom: 12,
  },

  oeste: {
    left: 18,
  },

  // ========================================
  // AGUJA
  // ========================================

  aguja: {
    position: "absolute",
    width: 12,
    height: 190,
    alignItems: "center",
    justifyContent: "center",
  },

  agujaNorte: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 80,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#ef4444",
  },

  agujaSur: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 80,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#334155",
  },

  centro: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },

  centroTexto: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "bold",
  },

  grados: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 15,
  },

  direccionTexto: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 2,
  },

  // ========================================
  // SENSOR
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
    color: "#2563eb",
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
  // INFORMACIÓN
  // ========================================

  info: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 12,
    marginTop: 12,
    paddingHorizontal: 15,
  },

});