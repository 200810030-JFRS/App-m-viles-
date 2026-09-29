import "react-native-gesture-handler";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  FlatList,
  Alert,
  StatusBar,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Ionicons } from "@expo/vector-icons";

import { Accelerometer } from "expo-sensors";

/* =========================================================
   NAVEGADORES
========================================================= */

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

/* =========================================================
   CARTAS DEL MEMORAMA
========================================================= */

const cartasIniciales = [
  { id: "1", valor: "🍎", encontrada: false },
  { id: "2", valor: "🍎", encontrada: false },

  { id: "3", valor: "🚗", encontrada: false },
  { id: "4", valor: "🚗", encontrada: false },

  { id: "5", valor: "🐶", encontrada: false },
  { id: "6", valor: "🐶", encontrada: false },

  { id: "7", valor: "⚽", encontrada: false },
  { id: "8", valor: "⚽", encontrada: false },

  { id: "9", valor: "🌟", encontrada: false },
  { id: "10", valor: "🌟", encontrada: false },

  { id: "11", valor: "🍕", encontrada: false },
  { id: "12", valor: "🍕", encontrada: false },
];

/* =========================================================
   MEZCLAR CARTAS
========================================================= */

function mezclarCartas(cartas) {
  return [...cartas].sort(() => Math.random() - 0.5);
}

/* =========================================================
   SPLASH SCREEN
========================================================= */

function SplashScreen({ terminar }) {
  const escala = useRef(new Animated.Value(0)).current;
  const opacidad = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(escala, {
        toValue: 1,
        friction: 5,
        tension: 80,
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
    }, 2500);

    return () => clearTimeout(tiempo);
  }, []);

  return (
    <View style={styles.splash}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.logoSplash,
          {
            transform: [{ scale: escala }],
            opacity: opacidad,
          },
        ]}
      >
        <Ionicons
          name="game-controller"
          size={70}
          color="#FFFFFF"
        />
      </Animated.View>

      <Animated.Text
        style={[
          styles.tituloSplash,
          {
            opacity: opacidad,
          },
        ]}
      >
        MEMORAMA
      </Animated.Text>

      <Animated.Text
        style={[
          styles.subtituloSplash,
          {
            opacity: opacidad,
          },
        ]}
      >
        Juego de memoria
      </Animated.Text>
    </View>
  );
}

/* =========================================================
   HOME SCREEN
========================================================= */

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botonMenu}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons
            name="menu"
            size={30}
            color="#222"
          />
        </TouchableOpacity>

        <Text style={styles.tituloHeader}>
          Inicio
        </Text>

        <View style={{ width: 45 }} />
      </View>

      <View style={styles.homeContent}>
        <View style={styles.logoHome}>
          <Ionicons
            name="game-controller"
            size={60}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.tituloHome}>
          Bienvenido a Memorama
        </Text>

        <Text style={styles.descripcionHome}>
          Encuentra todas las parejas y pon a prueba
          tu memoria usando el acelerómetro de tu
          dispositivo.
        </Text>

        <TouchableOpacity
          style={styles.botonJugar}
          onPress={() =>
            navigation.navigate("Juego")
          }
        >
          <Ionicons
            name="play"
            size={24}
            color="#FFFFFF"
          />

          <Text style={styles.textoBoton}>
            Jugar ahora
          </Text>
        </TouchableOpacity>

        <View style={styles.tarjetaInfo}>
          <Ionicons
            name="phone-portrait-outline"
            size={35}
            color="#6C63FF"
          />

          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}
          >
            <Text style={styles.infoTitulo}>
              Función especial
            </Text>

            <Text style={styles.infoTexto}>
              Agita tu teléfono para mezclar y
              reiniciar el juego automáticamente.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* =========================================================
   MEMORAMA CON ACELERÓMETRO
========================================================= */

function MemoramaScreen() {
  const [cartas, setCartas] = useState(
    mezclarCartas(cartasIniciales)
  );

  const [seleccionadas, setSeleccionadas] =
    useState([]);

  const [movimientos, setMovimientos] =
    useState(0);

  const [bloqueado, setBloqueado] =
    useState(false);

  /* DATOS DEL ACELERÓMETRO */

  const [datos, setDatos] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  /* EVITA MUCHOS REINICIOS POR UNA SOLA AGITACIÓN */

  const ultimoShake = useRef(0);

  /* =======================================================
     REINICIAR JUEGO
  ======================================================= */

  const reiniciarJuego = () => {
    setCartas(mezclarCartas(cartasIniciales));
    setSeleccionadas([]);
    setMovimientos(0);
    setBloqueado(false);
  };

  /* =======================================================
     ACELERÓMETRO
  ======================================================= */

  useEffect(() => {
    // Intervalo de actualización del sensor
    Accelerometer.setUpdateInterval(100);

    // Nos suscribimos al sensor
    const suscripcion = Accelerometer.addListener(
      (mediciones) => {
        setDatos({
          x: mediciones.x,
          y: mediciones.y,
          z: mediciones.z,
        });

        /* ---------------------------------------------------
           DETECTAR AGITACIÓN
        --------------------------------------------------- */

        const fuerza =
          Math.sqrt(
            mediciones.x * mediciones.x +
            mediciones.y * mediciones.y +
            mediciones.z * mediciones.z
          );

        const ahora = Date.now();

        /*
          Cuando el teléfono se mueve bruscamente,
          la magnitud de la aceleración aumenta.
        */

        if (
          fuerza > 2.2 &&
          ahora - ultimoShake.current > 1200
        ) {
          ultimoShake.current = ahora;

          reiniciarJuego();

          Alert.alert(
            "📱 ¡Agitación detectada!",
            "El memorama se ha mezclado nuevamente."
          );
        }
      }
    );

    /* -------------------------------------------------------
       DES-SUSCRIPCIÓN
    ------------------------------------------------------- */

    return () => {
      suscripcion.remove();
    };
  }, []);

  /* =======================================================
     SELECCIONAR CARTA
  ======================================================= */

  const seleccionarCarta = (carta) => {
    if (bloqueado) {
      return;
    }

    if (carta.encontrada) {
      return;
    }

    const yaSeleccionada =
      seleccionadas.find(
        (item) => item.id === carta.id
      );

    if (yaSeleccionada) {
      return;
    }

    const nuevasSeleccionadas = [
      ...seleccionadas,
      carta,
    ];

    setSeleccionadas(nuevasSeleccionadas);

    /* =====================================================
       SE COMPARAN DOS CARTAS
    ===================================================== */

    if (nuevasSeleccionadas.length === 2) {
      setMovimientos(
        (actual) => actual + 1
      );

      setBloqueado(true);

      const primera =
        nuevasSeleccionadas[0];

      const segunda =
        nuevasSeleccionadas[1];

      /* PAREJA CORRECTA */

      if (
        primera.valor === segunda.valor
      ) {
        setTimeout(() => {
          setCartas(
            (cartasActuales) =>
              cartasActuales.map(
                (item) => {
                  if (
                    item.valor ===
                    primera.valor
                  ) {
                    return {
                      ...item,
                      encontrada: true,
                    };
                  }

                  return item;
                }
              )
          );

          setSeleccionadas([]);
          setBloqueado(false);
        }, 600);
      }

      /* PAREJA INCORRECTA */

      else {
        setTimeout(() => {
          setSeleccionadas([]);
          setBloqueado(false);
        }, 900);
      }
    }
  };

  /* =======================================================
     COMPROBAR VICTORIA
  ======================================================= */

  useEffect(() => {
    const gano = cartas.every(
      (carta) =>
        carta.encontrada === true
    );

    if (gano) {
      Alert.alert(
        "🎉 ¡Felicidades!",
        `Completaste el memorama en ${movimientos} movimientos.`,
        [
          {
            text: "Jugar otra vez",
            onPress: reiniciarJuego,
          },
        ]
      );
    }
  }, [cartas]);

  /* =======================================================
     RENDERIZAR CARTA
  ======================================================= */

  const renderizarCarta = ({ item }) => {
    const visible =
      item.encontrada ||
      seleccionadas.some(
        (carta) =>
          carta.id === item.id
      );

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.carta,
          visible &&
            styles.cartaVisible,
        ]}
        onPress={() =>
          seleccionarCarta(item)
        }
      >
        {visible ? (
          <Text style={styles.emojiCarta}>
            {item.valor}
          </Text>
        ) : (
          <View style={styles.dorsoCarta}>
            <Ionicons
              name="help"
              size={35}
              color="#FFFFFF"
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /* =======================================================
     INTERFAZ
  ======================================================= */

  return (
    <View style={styles.container}>

      {/* ENCABEZADO */}

      <View style={styles.gameHeader}>
        <View>
          <Text style={styles.tituloJuego}>
            Memorama
          </Text>

          <Text style={styles.movimientos}>
            Movimientos: {movimientos}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botonReiniciar}
          onPress={reiniciarJuego}
        >
          <Ionicons
            name="refresh"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* ==================================================
          INFORMACIÓN DEL SENSOR
      ================================================== */}

      <View style={styles.sensorCard}>
        <View style={styles.sensorTituloFila}>
          <Ionicons
            name="phone-portrait-outline"
            size={24}
            color="#6C63FF"
          />

          <Text style={styles.sensorTitulo}>
            Acelerómetro
          </Text>
        </View>

        <Text style={styles.sensorAyuda}>
          Agita el teléfono para reiniciar y mezclar
          las cartas.
        </Text>

        <View style={styles.ejesContainer}>

          <View style={styles.eje}>
            <Text style={styles.ejeNombre}>
              X
            </Text>

            <Text style={styles.ejeValor}>
              {datos.x.toFixed(2)}
            </Text>
          </View>

          <View style={styles.eje}>
            <Text style={styles.ejeNombre}>
              Y
            </Text>

            <Text style={styles.ejeValor}>
              {datos.y.toFixed(2)}
            </Text>
          </View>

          <View style={styles.eje}>
            <Text style={styles.ejeNombre}>
              Z
            </Text>

            <Text style={styles.ejeValor}>
              {datos.z.toFixed(2)}
            </Text>
          </View>

        </View>
      </View>

      {/* ==================================================
          CARTAS
      ================================================== */}

      <FlatList
        data={cartas}
        renderItem={renderizarCarta}
        keyExtractor={(item) =>
          item.id
        }
        numColumns={3}
        columnWrapperStyle={
          styles.fila
        }
        contentContainerStyle={
          styles.contenedorCartas
        }
      />
    </View>
  );
}

/* =========================================================
   ESTADÍSTICAS
========================================================= */

function EstadisticasScreen() {
  return (
    <View style={styles.estadisticas}>
      <Ionicons
        name="trophy-outline"
        size={90}
        color="#6C63FF"
      />

      <Text
        style={styles.tituloEstadisticas}
      >
        Estadísticas
      </Text>

      <View
        style={styles.estadisticaCard}
      >
        <Ionicons
          name="trophy"
          size={27}
          color="#6C63FF"
        />

        <Text
          style={styles.estadisticaTexto}
        >
          Mejor puntuación:
          12 movimientos
        </Text>
      </View>

      <View
        style={styles.estadisticaCard}
      >
        <Ionicons
          name="game-controller"
          size={27}
          color="#6C63FF"
        />

        <Text
          style={styles.estadisticaTexto}
        >
          Partidas jugadas: 0
        </Text>
      </View>

      <View
        style={styles.estadisticaCard}
      >
        <Ionicons
          name="star"
          size={27}
          color="#6C63FF"
        />

        <Text
          style={styles.estadisticaTexto}
        >
          Nivel: Principiante
        </Text>
      </View>

      <View
        style={styles.estadisticaCard}
      >
        <Ionicons
          name="phone-portrait"
          size={27}
          color="#6C63FF"
        />

        <Text
          style={styles.estadisticaTexto}
        >
          Sensor: Acelerómetro
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   TAB NAVIGATION
========================================================= */

function TabNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor:
          "#6C63FF",

        tabBarInactiveTintColor:
          "#888",

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 5,
        },

        tabBarIcon: ({
          color,
          size,
        }) => {
          let icono =
            "grid-outline";

          if (
            route.name ===
            "Estadísticas"
          ) {
            icono =
              "stats-chart-outline";
          }

          return (
            <Ionicons
              name={icono}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Memorama"
        component={MemoramaScreen}
      />

      <Tab.Screen
        name="Estadísticas"
        component={EstadisticasScreen}
      />
    </Tab.Navigator>
  );
}

/* =========================================================
   ACERCA DE
========================================================= */

function AcercaDeScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botonMenu}
          onPress={() =>
            navigation.openDrawer()
          }
        >
          <Ionicons
            name="menu"
            size={30}
            color="#222"
          />
        </TouchableOpacity>

        <Text style={styles.tituloHeader}>
          Acerca de
        </Text>

        <View style={{ width: 45 }} />
      </View>

      <View
        style={styles.aboutContent}
      >
        <View style={styles.logoAbout}>
          <Ionicons
            name="game-controller"
            size={55}
            color="#FFFFFF"
          />
        </View>

        <Text
          style={styles.tituloAbout}
        >
          Memorama App
        </Text>

        <Text
          style={styles.textoAbout}
        >
          Aplicación desarrollada con
          React Native y Expo Go.
        </Text>

        <Text
          style={styles.textoAbout}
        >
          El proyecto utiliza navegación,
          animaciones, iconos, componentes
          funcionales y el sensor de
          acelerómetro.
        </Text>

        <View
          style={styles.caracteristicas}
        >
          <Caracteristica
            icono="sparkles-outline"
            texto="SplashScreen animado"
          />

          <Caracteristica
            icono="menu-outline"
            texto="Navigation Drawer"
          />

          <Caracteristica
            icono="albums-outline"
            texto="Tab Navigation"
          />

          <Caracteristica
            icono="game-controller-outline"
            texto="Juego Memorama"
          />

          <Caracteristica
            icono="phone-portrait-outline"
            texto="Sensor Acelerómetro"
          />
        </View>
      </View>
    </View>
  );
}

/* =========================================================
   COMPONENTE CARACTERÍSTICA
========================================================= */

function Caracteristica({
  icono,
  texto,
}) {
  return (
    <View
      style={styles.caracteristicaFila}
    >
      <Ionicons
        name={icono}
        size={25}
        color="#6C63FF"
      />

      <Text
        style={styles.caracteristicaTexto}
      >
        {texto}
      </Text>
    </View>
  );
}

/* =========================================================
   DRAWER
========================================================= */

function DrawerNavigation() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,

        drawerActiveTintColor:
          "#6C63FF",

        drawerLabelStyle: {
          fontSize: 16,
          marginLeft: -15,
        },

        drawerStyle: {
          width: 280,
        },
      }}
    >

      <Drawer.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          drawerIcon: ({
            color,
          }) => (
            <Ionicons
              name="home-outline"
              size={23}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Juego"
        component={TabNavigation}
        options={{
          drawerIcon: ({
            color,
          }) => (
            <Ionicons
              name="game-controller-outline"
              size={23}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Acerca de"
        component={AcercaDeScreen}
        options={{
          drawerIcon: ({
            color,
          }) => (
            <Ionicons
              name="information-circle-outline"
              size={23}
              color={color}
            />
          ),
        }}
      />

    </Drawer.Navigator>
  );
}

/* =========================================================
   APP PRINCIPAL
========================================================= */

export default function App() {
  const [cargando, setCargando] =
    useState(true);

  if (cargando) {
    return (
      <SplashScreen
        terminar={() =>
          setCargando(false)
        }
      />
    );
  }

  return (
    <NavigationContainer>
      <DrawerNavigation />
    </NavigationContainer>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

const styles = StyleSheet.create({

  /* SPLASH */

  splash: {
    flex: 1,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },

  logoSplash: {
    width: 145,
    height: 145,
    borderRadius: 75,
    backgroundColor: "#554BEF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },

  tituloSplash: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 25,
    letterSpacing: 3,
  },

  subtituloSplash: {
    color: "#E8E7FF",
    fontSize: 16,
    marginTop: 8,
  },

  /* GENERAL */

  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  /* HEADER */

  header: {
    height: 90,
    backgroundColor: "#FFFFFF",
    paddingTop: 25,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  botonMenu: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  tituloHeader: {
    color: "#222222",
    fontSize: 21,
    fontWeight: "bold",
  },

  /* HOME */

  homeContent: {
    flex: 1,
    paddingHorizontal: 25,
    alignItems: "center",
    paddingTop: 50,
  },

  logoHome: {
    width: 120,
    height: 120,
    backgroundColor: "#6C63FF",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 7,
  },

  tituloHome: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginTop: 25,
  },

  descripcionHome: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 12,
  },

  botonJugar: {
    width: "80%",
    height: 55,
    backgroundColor: "#6C63FF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 30,
    elevation: 5,
  },

  textoBoton: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },

  tarjetaInfo: {
    width: "95%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    marginTop: 30,
    elevation: 3,
  },

  infoTitulo: {
    color: "#222",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 5,
  },

  infoTexto: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },

  /* JUEGO */

  gameHeader: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tituloJuego: {
    fontSize: 28,
    color: "#222",
    fontWeight: "bold",
  },

  movimientos: {
    color: "#777",
    fontSize: 15,
    marginTop: 5,
  },

  botonReiniciar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* SENSOR */

  sensorCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    marginTop: 12,
    borderRadius: 16,
    padding: 15,
    elevation: 3,
  },

  sensorTituloFila: {
    flexDirection: "row",
    alignItems: "center",
  },

  sensorTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 8,
  },

  sensorAyuda: {
    fontSize: 13,
    color: "#666",
    marginTop: 5,
    marginBottom: 12,
  },

  ejesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  eje: {
    width: "30%",
    backgroundColor: "#F0EFFF",
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
  },

  ejeNombre: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6C63FF",
  },

  ejeValor: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginTop: 3,
  },

  /* CARTAS */

  contenedorCartas: {
    padding: 15,
    paddingBottom: 30,
  },

  fila: {
    justifyContent: "space-between",
    marginBottom: 12,
  },

  carta: {
    width: "31%",
    aspectRatio: 0.9,
    backgroundColor: "#6C63FF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  cartaVisible: {
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#6C63FF",
  },

  dorsoCarta: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },

  emojiCarta: {
    fontSize: 42,
  },

  /* ESTADÍSTICAS */

  estadisticas: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  tituloEstadisticas: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#222",
    marginTop: 20,
    marginBottom: 30,
  },

  estadisticaCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },

  estadisticaTexto: {
    color: "#444",
    fontSize: 16,
    marginLeft: 12,
  },

  /* ACERCA DE */

  aboutContent: {
    flex: 1,
    alignItems: "center",
    padding: 25,
    paddingTop: 50,
  },

  logoAbout: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  tituloAbout: {
    color: "#222",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
  },

  textoAbout: {
    color: "#666",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },

  caracteristicas: {
    width: "95%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginTop: 25,
    elevation: 3,
  },

  caracteristicaFila: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  caracteristicaTexto: {
    color: "#333",
    fontSize: 16,
    marginLeft: 12,
  },

});